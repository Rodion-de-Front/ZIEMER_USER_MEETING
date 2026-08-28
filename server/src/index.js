import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import cron from 'node-cron'
import express from 'express'
import jwt from 'jsonwebtoken'
import pg from 'pg'
import webpush from 'web-push'
import { z } from 'zod'

const { Pool } = pg
const app = express()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const port = Number(process.env.PORT || 3000)
const jwtSecret = process.env.JWT_SECRET
const adminEmails = (process.env.ADMIN_EMAIL || 'admin@bk.ru')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

if (!jwtSecret) throw new Error('JWT_SECRET is required')
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:admin@bk.ru', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY)
}

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }))
app.use(express.json({ limit: '100kb' }))

const registration = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  fullName: z.string().trim().min(2).max(160),
  workplace: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
})
const campaignSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(500),
  scheduledFor: z.string().datetime().optional(),
})
const blockUserSchema = z.object({
  blocked: z.boolean(),
})

function tokenFor(user) {
  return jwt.sign({ sub: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: '7d' })
}

function publicUser(user) {
  const { password_hash: _passwordHash, ...safeUser } = user
  return safeUser
}

async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'Требуется авторизация' })
    const tokenUser = jwt.verify(token, jwtSecret)
    const { rows } = await pool.query('select id, role, suspended_at from users where id = $1', [tokenUser.sub])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Пользователь не найден' })
    if (user.suspended_at) return res.status(403).json({ error: 'Ваш аккаунт заблокирован', code: 'ACCOUNT_BLOCKED' })
    req.user = { ...tokenUser, role: user.role }
    next()
  } catch {
    res.status(401).json({ error: 'Сессия истекла. Войдите повторно.' })
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Недостаточно прав' })
  next()
}

app.get('/api/health', async (_req, res) => {
  await pool.query('select 1')
  res.json({ ok: true })
})

app.post('/api/auth/register', async (req, res) => {
  const parsed = registration.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Проверьте обязательные поля формы' })
  const input = parsed.data
  const email = input.email.toLowerCase()
  try {
    const passwordHash = await bcrypt.hash(input.password, 12)
    const { rows } = await pool.query(
      `insert into users (email, password_hash, full_name, workplace, city, phone, role)
       values ($1, $2, $3, $4, $5, $6, $7) returning *`,
      [email, passwordHash, input.fullName, input.workplace, input.city, input.phone || null, adminEmails.includes(email) ? 'admin' : 'user'],
    )
    const user = publicUser(rows[0])
    res.status(201).json({ token: tokenFor(user), user })
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Этот email уже зарегистрирован' })
    throw error
  }
})

app.post('/api/auth/login', async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body)
  if (!input.success) return res.status(400).json({ error: 'Введите email и пароль' })
  const { rows } = await pool.query('select * from users where email = $1', [input.data.email.toLowerCase()])
  const user = rows[0]
  if (!user || !(await bcrypt.compare(input.data.password, user.password_hash))) return res.status(401).json({ error: 'Неверный email или пароль' })
  if (user.suspended_at) return res.status(403).json({ error: 'Ваш аккаунт заблокирован', code: 'ACCOUNT_BLOCKED' })
  res.json({ token: tokenFor(user), user: publicUser(user) })
})

app.get('/api/auth/me', auth, async (req, res) => {
  const { rows } = await pool.query('select id, email, full_name, workplace, city, phone, role, created_at from users where id = $1', [req.user.sub])
  if (!rows[0]) return res.status(404).json({ error: 'Пользователь не найден' })
  res.json({ user: rows[0] })
})

app.post('/api/push/subscribe', auth, async (req, res) => {
  const input = z.object({ subscription: z.object({ endpoint: z.string().url() }).passthrough() }).safeParse(req.body)
  if (!input.success) return res.status(400).json({ error: 'Некорректная push-подписка' })
  await pool.query(
    `insert into push_subscriptions (user_id, endpoint, subscription) values ($1, $2, $3)
     on conflict (endpoint) do update set user_id = excluded.user_id, subscription = excluded.subscription`,
    [req.user.sub, input.data.subscription.endpoint, input.data.subscription],
  )
  res.status(204).end()
})

app.get('/api/notifications', auth, async (_req, res) => {
  const { rows } = await pool.query(
    `select c.id, c.title, c.body, c.sent_at, c.created_at,
       (r.read_at is not null) as read
     from push_campaigns c
     left join notification_reads r on r.campaign_id = c.id and r.user_id = $1
     where c.status = 'sent'
     order by c.sent_at desc nulls last, c.created_at desc
     limit 30`,
    [_req.user.sub],
  )
  res.json({ notifications: rows })
})

app.post('/api/notifications/read-all', auth, async (req, res) => {
  await pool.query(
    `insert into notification_reads (user_id, campaign_id)
     select $1, id from push_campaigns where status = 'sent'
     on conflict (user_id, campaign_id) do nothing`,
    [req.user.sub],
  )
  res.status(204).end()
})

app.get('/api/admin/users', auth, adminOnly, async (req, res) => {
  const query = String(req.query.q || '').trim()
  const values = []
  let where = ''
  if (query) {
    values.push(`%${query}%`)
    where = 'where full_name ilike $1 or email ilike $1 or workplace ilike $1 or city ilike $1 or phone ilike $1'
  }
  const { rows } = await pool.query(
    `select id, email, full_name, workplace, city, phone, role, suspended_at, created_at from users ${where} order by created_at desc limit 500`,
    values,
  )
  res.json({ users: rows })
})

app.patch('/api/admin/users/:id/block', auth, adminOnly, async (req, res) => {
  const parsed = blockUserSchema.safeParse(req.body)
  if (!parsed.success || !z.string().uuid().safeParse(req.params.id).success) return res.status(400).json({ error: 'Некорректные данные пользователя' })
  if (req.params.id === req.user.sub) return res.status(403).json({ error: 'Нельзя заблокировать свой аккаунт' })

  const { rows: users } = await pool.query('select id, role from users where id = $1', [req.params.id])
  const user = users[0]
  if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
  if (user.role === 'admin') return res.status(403).json({ error: 'Нельзя заблокировать администратора' })

  const { rows } = await pool.query(
    'update users set suspended_at = case when $2 then now() else null end, updated_at = now() where id = $1 returning id, suspended_at',
    [req.params.id, parsed.data.blocked],
  )
  res.json({ user: rows[0] })
})

app.get('/api/admin/campaigns', auth, adminOnly, async (_req, res) => {
  const { rows } = await pool.query('select * from push_campaigns order by created_at desc limit 20')
  res.json({ campaigns: rows })
})

app.post('/api/admin/campaigns', auth, adminOnly, async (req, res) => {
  const parsed = campaignSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Проверьте данные рассылки' })
  const scheduledFor = parsed.data.scheduledFor || new Date().toISOString()
  const { rows } = await pool.query(
    'insert into push_campaigns (title, body, scheduled_for, created_by) values ($1, $2, $3, $4) returning *',
    [parsed.data.title, parsed.data.body, scheduledFor, req.user.sub],
  )
  if (!parsed.data.scheduledFor) sendDueCampaigns().catch(console.error)
  res.status(201).json({ campaign: rows[0] })
})

async function sendDueCampaigns() {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return
  const client = await pool.connect()
  try {
    await client.query('begin')
    const { rows: campaigns } = await client.query(
      `select * from push_campaigns where status = 'scheduled' and scheduled_for <= now()
       order by scheduled_for for update skip locked`,
    )
    for (const campaign of campaigns) {
      await client.query(`update push_campaigns set status = 'sending' where id = $1`, [campaign.id])
      const { rows: subscriptions } = await client.query(
        `select s.id, s.subscription from push_subscriptions s
         join users u on u.id = s.user_id
         where u.suspended_at is null`,
      )
      let delivered = 0
      let failed = 0
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(subscription.subscription, JSON.stringify({ title: campaign.title, body: campaign.body, url: '/' }))
          delivered += 1
        } catch (error) {
          failed += 1
          if ([404, 410].includes(error.statusCode)) await client.query('delete from push_subscriptions where id = $1', [subscription.id])
        }
      }
      await client.query(
        `update push_campaigns set status = 'sent', sent_at = now(), delivery_count = $2, failure_count = $3 where id = $1`,
        [campaign.id, delivered, failed],
      )
    }
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}

cron.schedule('* * * * *', () => sendDueCampaigns().catch(console.error))

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Внутренняя ошибка сервера' })
})

async function start() {
  // Existing Docker volumes skip init scripts added after their first launch.
  // Keep the new read-state table available without requiring data deletion.
  await pool.query(
    `create table if not exists notification_reads (
      user_id uuid not null references users(id) on delete cascade,
      campaign_id uuid not null references push_campaigns(id) on delete cascade,
      read_at timestamptz not null default now(),
      primary key (user_id, campaign_id)
    )`,
  )
  await pool.query('alter table users add column if not exists suspended_at timestamptz null')
  app.listen(port, () => console.log(`API listening on ${port}`))
}

start().catch((error) => {
  console.error('Failed to initialize database:', error)
  process.exit(1)
})
