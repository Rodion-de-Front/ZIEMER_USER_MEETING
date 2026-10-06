import "dotenv/config";
import bcrypt from "bcryptjs";
import cors from "cors";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import cron from "node-cron";
import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import pg from "pg";
import webpush from "web-push";
import { z } from "zod";

const { Pool } = pg;
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;
const pushTimeoutMs = Number(process.env.PUSH_TIMEOUT_MS || 10000);
const feedbackEmailRecipient =
  process.env.FEEDBACK_EMAIL_RECIPIENT || "office@femtomed.ru";
const feedbackEmailSubject =
  process.env.FEEDBACK_EMAIL_SUBJECT || "отзыв из приложения ZIEMER USER MEETING";
const passwordResetCodeTtlMinutes = Number(
  process.env.PASSWORD_RESET_CODE_TTL_MINUTES || 10,
);
const passwordResetMaxAttempts = Number(
  process.env.PASSWORD_RESET_MAX_ATTEMPTS || 5,
);
const emailVerificationCodeTtlMinutes = Number(
  process.env.EMAIL_VERIFICATION_CODE_TTL_MINUTES || 10,
);
const emailVerificationMaxAttempts = Number(
  process.env.EMAIL_VERIFICATION_MAX_ATTEMPTS || 5,
);
const adminEmails = (process.env.ADMIN_EMAIL || "admin@bk.ru")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

if (!jwtSecret) throw new Error("JWT_SECRET is required");
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@bk.ru",
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - startedAt}ms`,
    );
  });
  next();
});

const registration = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
  fullName: z.string().trim().min(2).max(160),
  workplace: z.string().trim().min(2).max(160),
  city: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  verificationToken: z.string().min(1),
});
const campaignSchema = z.object({
  title: z.string().trim().min(1).max(100),
  body: z.string().trim().min(1).max(500),
  scheduledFor: z.string().datetime().optional(),
});
const blockUserSchema = z.object({
  blocked: z.boolean(),
});
const feedbackSchema = z.object({
  fullName: z.string().trim().min(2).max(160),
  rating: z.number().int().min(1).max(5),
  message: z.string().trim().min(2).max(2000),
});
const passwordResetRequestSchema = z.object({
  email: z.string().email().max(255),
  language: z.enum(["ru", "en"]).optional(),
});
const verificationCodeSchema = z.object({
  email: z.string().email().max(255),
  code: z.string().regex(/^\d{6}$/),
});
const passwordResetConfirmSchema = z.object({
  resetToken: z.string().min(1),
  password: z.string().min(6).max(128),
});
const registrationCodeRequestSchema = z.object({
  email: z.string().email().max(255),
  language: z.enum(["ru", "en"]).optional(),
});

function tokenFor(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
      ver: user.auth_version ?? 0,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );
}

function publicUser(user) {
  const {
    password_hash: _passwordHash,
    auth_version: _authVersion,
    ...safeUser
  } = user;
  return safeUser;
}

function hashPasswordResetCode(userId, code) {
  return createHmac("sha256", jwtSecret).update(`${userId}:${code}`).digest();
}

function passwordResetCodeMatches(userId, code, storedHash) {
  const expected = hashPasswordResetCode(userId, code);
  const actual = Buffer.from(storedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashRegistrationCode(email, code) {
  return createHmac("sha256", jwtSecret)
    .update(`registration:${email}:${code}`)
    .digest();
}

function registrationCodeMatches(email, code, storedHash) {
  const expected = hashRegistrationCode(email, code);
  const actual = Buffer.from(storedHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashesMatch(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function createMailTransport() {
  if (!process.env.SMTP_HOST) return null;
  const auth =
    process.env.SMTP_USER && process.env.SMTP_PASSWORD
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth,
  });
}

async function sendFeedbackEmail(feedback, user) {
  const transport = createMailTransport();
  if (!transport) throw new Error("SMTP_HOST is not configured");
  const from =
    process.env.FEEDBACK_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "ZIEMER USER MEETING <no-reply@ziemergroup.ru>";
  await transport.sendMail({
    from,
    to: feedbackEmailRecipient,
    subject: feedbackEmailSubject,
    text: [
      "Получен новый отзыв из приложения ZIEMER USER MEETING.",
      "",
      `ФИО в форме: ${feedback.full_name}`,
      `Оценка: ${feedback.rating}/5`,
      `Пользователь: ${user.full_name}`,
      `Email пользователя: ${user.email}`,
      `Место работы: ${user.workplace}`,
      `Город: ${user.city}`,
      user.phone ? `Телефон: ${user.phone}` : null,
      "",
      "Отзыв:",
      feedback.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

async function sendPasswordResetEmail(user, code, language = "ru") {
  const transport = createMailTransport();
  if (!transport) throw new Error("SMTP_HOST is not configured");
  const from =
    process.env.PASSWORD_RESET_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "ZIEMER CLUB <no-reply@ziemergroup.ru>";
  const isEnglish = language === "en";
  await transport.sendMail({
    from,
    to: user.email,
    subject: isEnglish
      ? "Password reset code — ZIEMER CLUB"
      : "Код восстановления пароля — ZIEMER CLUB",
    text: isEnglish
      ? [
          `Hello, ${user.full_name}.`,
          "",
          `Your password reset code: ${code}`,
          `The code is valid for ${passwordResetCodeTtlMinutes} minutes.`,
          "If you did not request a password reset, you can ignore this email.",
        ].join("\n")
      : [
          `Здравствуйте, ${user.full_name}.`,
          "",
          `Ваш код для восстановления пароля: ${code}`,
          `Код действует ${passwordResetCodeTtlMinutes} минут.`,
          "Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.",
        ].join("\n"),
  });
}

async function sendRegistrationCodeEmail(email, code, language = "ru") {
  const transport = createMailTransport();
  if (!transport) throw new Error("SMTP_HOST is not configured");
  const from =
    process.env.REGISTRATION_EMAIL_FROM ||
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "ZIEMER CLUB <no-reply@ziemergroup.ru>";
  const isEnglish = language === "en";
  await transport.sendMail({
    from,
    to: email,
    subject: isEnglish
      ? "Email verification code — ZIEMER CLUB"
      : "Код подтверждения почты — ZIEMER CLUB",
    text: isEnglish
      ? [
          "Your ZIEMER CLUB email verification code:",
          "",
          code,
          "",
          `The code is valid for ${emailVerificationCodeTtlMinutes} minutes.`,
          "If you did not request this code, you can ignore this email.",
        ].join("\n")
      : [
          "Ваш код подтверждения почты для ZIEMER CLUB:",
          "",
          code,
          "",
          `Код действует ${emailVerificationCodeTtlMinutes} минут.`,
          "Если вы не запрашивали этот код, просто проигнорируйте письмо.",
        ].join("\n"),
  });
}

async function auth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Требуется авторизация" });
    const tokenUser = jwt.verify(token, jwtSecret);
    const { rows } = await pool.query(
      "select id, role, suspended_at, auth_version from users where id = $1",
      [tokenUser.sub],
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Пользователь не найден" });
    if (user.suspended_at)
      return res
        .status(403)
        .json({ error: "Ваш аккаунт заблокирован", code: "ACCOUNT_BLOCKED" });
    if ((tokenUser.ver ?? 0) !== user.auth_version)
      return res.status(401).json({ error: "Сессия истекла. Войдите повторно." });
    req.user = { ...tokenUser, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: "Сессия истекла. Войдите повторно." });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Недостаточно прав" });
  next();
}

app.get("/api/health", async (_req, res) => {
  await pool.query("select 1");
  res.json({ ok: true });
});

app.post("/api/auth/registration-code/request", async (req, res) => {
  const parsed = registrationCodeRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Введите корректный email" });

  const email = parsed.data.email.toLowerCase();
  const { rows: existingUsers } = await pool.query(
    "select 1 from users where email = $1",
    [email],
  );
  if (existingUsers.length)
    return res.status(409).json({
      error: "Этот email уже зарегистрирован",
      code: "EMAIL_ALREADY_REGISTERED",
    });

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const codeHash = hashRegistrationCode(email, code);
  const { rows: savedCodes } = await pool.query(
    `insert into registration_codes (email, code_hash, expires_at, requested_at, attempts, verified_at)
     values ($1, $2, now() + ($3 * interval '1 minute'), now(), 0, null)
     on conflict (email) do update set
       code_hash = excluded.code_hash,
       expires_at = excluded.expires_at,
       requested_at = excluded.requested_at,
       attempts = 0,
       verified_at = null
     where registration_codes.requested_at <= now() - interval '1 minute'
     returning email`,
    [email, codeHash, emailVerificationCodeTtlMinutes],
  );
  if (!savedCodes.length)
    return res.status(429).json({
      error: "Код уже отправлен. Повторите попытку через минуту.",
      code: "VERIFICATION_CODE_RATE_LIMITED",
    });

  try {
    await sendRegistrationCodeEmail(email, code, parsed.data.language);
  } catch (error) {
    console.error("Failed to send registration code email:", error);
    await pool.query(
      "delete from registration_codes where email = $1 and code_hash = $2",
      [email, codeHash],
    );
    return res.status(503).json({
      error: "Не удалось отправить код. Попробуйте ещё раз позже.",
      code: "EMAIL_DELIVERY_FAILED",
    });
  }

  res.json({ ok: true, expiresInMinutes: emailVerificationCodeTtlMinutes });
});

app.post("/api/auth/registration-code/verify", async (req, res) => {
  const parsed = verificationCodeSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: "Введите 6-значный код",
      code: "INVALID_VERIFICATION_CODE",
    });

  const email = parsed.data.email.toLowerCase();
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "select * from registration_codes where email = $1 for update",
      [email],
    );
    const verification = rows[0];
    const valid =
      verification &&
      verification.attempts < emailVerificationMaxAttempts &&
      new Date(verification.expires_at).getTime() > Date.now() &&
      registrationCodeMatches(email, parsed.data.code, verification.code_hash);

    if (!valid) {
      if (verification) {
        if (
          verification.attempts + 1 >= emailVerificationMaxAttempts ||
          new Date(verification.expires_at).getTime() <= Date.now()
        ) {
          await client.query("delete from registration_codes where email = $1", [
            email,
          ]);
        } else {
          await client.query(
            "update registration_codes set attempts = attempts + 1 where email = $1",
            [email],
          );
        }
      }
      await client.query("commit");
      return res.status(400).json({
        error: "Код неверен или истёк. Запросите новый код.",
        code: "INVALID_VERIFICATION_CODE",
      });
    }

    await client.query(
      "update registration_codes set verified_at = now() where email = $1",
      [email],
    );
    await client.query("commit");
    const verificationToken = jwt.sign(
      {
        purpose: "registration-email",
        email,
        codeHash: Buffer.from(verification.code_hash).toString("hex"),
      },
      jwtSecret,
      { expiresIn: `${emailVerificationCodeTtlMinutes}m` },
    );
    res.json({ verificationToken });
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
});

app.post("/api/auth/register", async (req, res) => {
  const parsed = registration.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Проверьте обязательные поля формы" });
  const input = parsed.data;
  const email = input.email.toLowerCase();
  let verifiedEmail;
  try {
    verifiedEmail = jwt.verify(input.verificationToken, jwtSecret);
  } catch {
    return res.status(400).json({
      error: "Подтверждение почты истекло. Запросите новый код.",
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  }
  if (
    verifiedEmail.purpose !== "registration-email" ||
    verifiedEmail.email !== email ||
    typeof verifiedEmail.codeHash !== "string"
  ) {
    return res.status(400).json({
      error: "Сначала подтвердите почту кодом.",
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows: verificationRows } = await client.query(
      "select * from registration_codes where email = $1 for update",
      [email],
    );
    const verification = verificationRows[0];
    const tokenCodeHash = Buffer.from(verifiedEmail.codeHash, "hex");
    if (
      !verification ||
      !verification.verified_at ||
      new Date(verification.expires_at).getTime() <= Date.now() ||
      !hashesMatch(verification.code_hash, tokenCodeHash)
    ) {
      await client.query("rollback");
      return res.status(400).json({
        error: "Подтверждение почты истекло. Запросите новый код.",
        code: "EMAIL_VERIFICATION_REQUIRED",
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const { rows } = await client.query(
      `insert into users (email, password_hash, full_name, workplace, city, phone, role)
       values ($1, $2, $3, $4, $5, $6, $7) returning *`,
      [
        email,
        passwordHash,
        input.fullName,
        input.workplace,
        input.city,
        input.phone || null,
        adminEmails.includes(email) ? "admin" : "user",
      ],
    );
    await client.query("delete from registration_codes where email = $1", [email]);
    await client.query("commit");
    const user = publicUser(rows[0]);
    res.status(201).json({ token: tokenFor(rows[0]), user });
  } catch (error) {
    await client.query("rollback");
    if (error.code === "23505")
      return res.status(409).json({ error: "Этот email уже зарегистрирован" });
    throw error;
  } finally {
    client.release();
  }
});

app.post("/api/auth/login", async (req, res) => {
  const input = z
    .object({ email: z.string().email(), password: z.string().min(1) })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: "Введите email и пароль" });
  const { rows } = await pool.query("select * from users where email = $1", [
    input.data.email.toLowerCase(),
  ]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(input.data.password, user.password_hash)))
    return res.status(401).json({ error: "Неверный email или пароль" });
  if (user.suspended_at)
    return res
      .status(403)
      .json({ error: "Ваш аккаунт заблокирован", code: "ACCOUNT_BLOCKED" });
  res.json({ token: tokenFor(user), user: publicUser(user) });
});

app.post("/api/auth/password-reset/request", async (req, res) => {
  const parsed = passwordResetRequestSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Введите корректный email" });

  const email = parsed.data.email.toLowerCase();
  const { rows } = await pool.query(
    "select id, email, full_name from users where email = $1",
    [email],
  );
  const user = rows[0];

  if (user) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const codeHash = hashPasswordResetCode(user.id, code);
    const { rows: savedCodes } = await pool.query(
      `insert into password_reset_codes (user_id, code_hash, expires_at, requested_at, attempts)
       values ($1, $2, now() + ($3 * interval '1 minute'), now(), 0)
       on conflict (user_id) do update set
         code_hash = excluded.code_hash,
         expires_at = excluded.expires_at,
         requested_at = excluded.requested_at,
         attempts = 0
       where password_reset_codes.requested_at <= now() - interval '1 minute'
       returning user_id`,
      [user.id, codeHash, passwordResetCodeTtlMinutes],
    );
    if (savedCodes.length) {
      try {
        await sendPasswordResetEmail(user, code, parsed.data.language);
      } catch (error) {
        console.error("Failed to send password reset email:", error);
        await pool.query(
          "delete from password_reset_codes where user_id = $1 and code_hash = $2",
          [user.id, codeHash],
        );
      }
    }
  }

  res.json({ ok: true, expiresInMinutes: passwordResetCodeTtlMinutes });
});

app.post("/api/auth/password-reset/verify", async (req, res) => {
  const parsed = verificationCodeSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: "Введите 6-значный код",
      code: "INVALID_RESET_CODE",
    });

  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      `select c.user_id, c.code_hash, c.expires_at, c.attempts
       from password_reset_codes c
       join users u on u.id = c.user_id
       where u.email = $1
       for update of c`,
      [parsed.data.email.toLowerCase()],
    );
    const reset = rows[0];
    const valid =
      reset &&
      reset.attempts < passwordResetMaxAttempts &&
      new Date(reset.expires_at).getTime() > Date.now() &&
      passwordResetCodeMatches(reset.user_id, parsed.data.code, reset.code_hash);

    if (!valid) {
      if (reset) {
        if (
          reset.attempts + 1 >= passwordResetMaxAttempts ||
          new Date(reset.expires_at).getTime() <= Date.now()
        ) {
          await client.query(
            "delete from password_reset_codes where user_id = $1",
            [reset.user_id],
          );
        } else {
          await client.query(
            "update password_reset_codes set attempts = attempts + 1 where user_id = $1",
            [reset.user_id],
          );
        }
      }
      await client.query("commit");
      return res.status(400).json({
        error: "Код неверен или истёк. Запросите новый код.",
        code: "INVALID_RESET_CODE",
      });
    }

    await client.query("commit");
    const resetToken = jwt.sign(
      {
        purpose: "password-reset",
        sub: reset.user_id,
        email: parsed.data.email.toLowerCase(),
        codeHash: Buffer.from(reset.code_hash).toString("hex"),
      },
      jwtSecret,
      { expiresIn: `${passwordResetCodeTtlMinutes}m` },
    );
    res.json({ resetToken });
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
});

app.post("/api/auth/password-reset/confirm", async (req, res) => {
  const parsed = passwordResetConfirmSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: "Введите новый пароль",
      code: "INVALID_RESET_DATA",
    });

  let verifiedReset;
  try {
    verifiedReset = jwt.verify(parsed.data.resetToken, jwtSecret);
  } catch {
    return res.status(400).json({
      error: "Подтверждение истекло. Запросите новый код.",
      code: "INVALID_RESET_TOKEN",
    });
  }
  if (
    verifiedReset.purpose !== "password-reset" ||
    !verifiedReset.sub ||
    typeof verifiedReset.codeHash !== "string"
  ) {
    return res.status(400).json({
      error: "Сначала подтвердите код из письма.",
      code: "INVALID_RESET_TOKEN",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows } = await client.query(
      "select * from password_reset_codes where user_id = $1 for update",
      [verifiedReset.sub],
    );
    const reset = rows[0];
    const tokenCodeHash = Buffer.from(verifiedReset.codeHash, "hex");
    if (
      !reset ||
      new Date(reset.expires_at).getTime() <= Date.now() ||
      !hashesMatch(reset.code_hash, tokenCodeHash)
    ) {
      await client.query("rollback");
      return res.status(400).json({
        error: "Подтверждение истекло. Запросите новый код.",
        code: "INVALID_RESET_TOKEN",
      });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await client.query(
      "update users set password_hash = $2, auth_version = auth_version + 1, updated_at = now() where id = $1",
      [reset.user_id, passwordHash],
    );
    await client.query("delete from password_reset_codes where user_id = $1", [
      reset.user_id,
    ]);
    await client.query("commit");
    res.json({ ok: true });
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
});

app.get("/api/auth/me", auth, async (req, res) => {
  const { rows } = await pool.query(
    "select id, email, full_name, workplace, city, phone, role, created_at from users where id = $1",
    [req.user.sub],
  );
  if (!rows[0])
    return res.status(404).json({ error: "Пользователь не найден" });
  res.json({ user: rows[0] });
});

app.post("/api/push/subscribe", auth, async (req, res) => {
  const input = z
    .object({
      subscription: z.object({ endpoint: z.string().url() }).passthrough(),
    })
    .safeParse(req.body);
  if (!input.success)
    return res.status(400).json({ error: "Некорректная push-подписка" });
  await pool.query(
    `insert into push_subscriptions (user_id, endpoint, subscription) values ($1, $2, $3)
     on conflict (endpoint) do update set user_id = excluded.user_id, subscription = excluded.subscription`,
    [req.user.sub, input.data.subscription.endpoint, input.data.subscription],
  );
  res.status(204).end();
});

app.post("/api/feedback", auth, async (req, res) => {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Проверьте данные отзыва" });

  const { rows: users } = await pool.query(
    "select id, email, full_name, workplace, city, phone from users where id = $1",
    [req.user.sub],
  );
  const user = users[0];
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });

  const { rows } = await pool.query(
    `insert into feedback_messages (user_id, full_name, rating, message)
     values ($1, $2, $3, $4)
     returning *`,
    [
      req.user.sub,
      parsed.data.fullName,
      parsed.data.rating,
      parsed.data.message,
    ],
  );
  const feedback = rows[0];

  try {
    await sendFeedbackEmail(feedback, user);
    const { rows: updatedRows } = await pool.query(
      "update feedback_messages set email_sent_at = now(), email_error = null where id = $1 returning *",
      [feedback.id],
    );
    return res.status(201).json({ feedback: updatedRows[0] });
  } catch (error) {
    console.error("Failed to send feedback email:", error);
    const { rows: updatedRows } = await pool.query(
      "update feedback_messages set email_error = $2 where id = $1 returning *",
      [feedback.id, error.message.slice(0, 500)],
    );
    return res.status(201).json({ feedback: updatedRows[0] });
  }
});

app.get("/api/notifications", auth, async (_req, res) => {
  const { rows } = await pool.query(
    `select c.id, c.title, c.body, c.sent_at, c.created_at,
       (r.read_at is not null) as read
     from push_campaigns c
     left join notification_reads r on r.campaign_id = c.id and r.user_id = $1
     where c.status = 'sent'
     order by c.sent_at desc nulls last, c.created_at desc
     limit 30`,
    [_req.user.sub],
  );
  res.json({ notifications: rows });
});

app.post("/api/notifications/read-all", auth, async (req, res) => {
  await pool.query(
    `insert into notification_reads (user_id, campaign_id)
     select $1, id from push_campaigns where status = 'sent'
     on conflict (user_id, campaign_id) do nothing`,
    [req.user.sub],
  );
  res.status(204).end();
});

app.get("/api/admin/users", auth, adminOnly, async (req, res) => {
  const query = String(req.query.q || "").trim();
  const values = [];
  let where = "";
  if (query) {
    values.push(`%${query}%`);
    where =
      "where full_name ilike $1 or email ilike $1 or workplace ilike $1 or city ilike $1 or phone ilike $1";
  }
  const { rows } = await pool.query(
    `select id, email, full_name, workplace, city, phone, role, suspended_at, created_at from users ${where} order by created_at desc limit 500`,
    values,
  );
  res.json({ users: rows });
});

app.patch("/api/admin/users/:id/block", auth, adminOnly, async (req, res) => {
  const parsed = blockUserSchema.safeParse(req.body);
  if (!parsed.success || !z.string().uuid().safeParse(req.params.id).success)
    return res.status(400).json({ error: "Некорректные данные пользователя" });
  if (req.params.id === req.user.sub)
    return res.status(403).json({ error: "Нельзя заблокировать свой аккаунт" });

  const { rows: users } = await pool.query(
    "select id, role from users where id = $1",
    [req.params.id],
  );
  const user = users[0];
  if (!user) return res.status(404).json({ error: "Пользователь не найден" });
  if (user.role === "admin")
    return res
      .status(403)
      .json({ error: "Нельзя заблокировать администратора" });

  const { rows } = await pool.query(
    "update users set suspended_at = case when $2 then now() else null end, updated_at = now() where id = $1 returning id, suspended_at",
    [req.params.id, parsed.data.blocked],
  );
  res.json({ user: rows[0] });
});

app.get("/api/admin/campaigns", auth, adminOnly, async (_req, res) => {
  const { rows } = await pool.query(
    "select * from push_campaigns order by created_at desc limit 20",
  );
  res.json({ campaigns: rows });
});

app.get("/api/admin/feedback", auth, adminOnly, async (_req, res) => {
  const { rows } = await pool.query(
    `select f.id, f.full_name, f.rating, f.message, f.email_sent_at, f.email_error, f.created_at,
       u.email as user_email, u.full_name as user_full_name, u.workplace, u.city, u.phone
     from feedback_messages f
     left join users u on u.id = f.user_id
     order by f.created_at desc
     limit 100`,
  );
  res.json({ feedback: rows });
});

app.post("/api/admin/campaigns", auth, adminOnly, async (req, res) => {
  const parsed = campaignSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Проверьте данные рассылки" });
  console.log(
    `Creating push campaign: scheduled=${Boolean(parsed.data.scheduledFor)}`,
  );
  const scheduledFor = parsed.data.scheduledFor || new Date().toISOString();
  const { rows } = await pool.query(
    "insert into push_campaigns (title, body, scheduled_for, created_by) values ($1, $2, $3, $4) returning *",
    [parsed.data.title, parsed.data.body, scheduledFor, req.user.sub],
  );
  let campaign = rows[0];
  if (!parsed.data.scheduledFor) {
    try {
      await sendDueCampaigns({ requireConfig: true });
      const { rows: updatedRows } = await pool.query(
        "select * from push_campaigns where id = $1",
        [campaign.id],
      );
      campaign = updatedRows[0] || campaign;
    } catch (error) {
      console.error("Failed to send push campaign immediately:", error);
      return res.status(500).json({
        error:
          error.message === "VAPID keys are not configured"
            ? "VAPID-ключи не настроены в API-контейнере"
            : "Push-уведомление не отправлено",
      });
    }
  }
  res.status(201).json({ campaign });
});

async function sendDueCampaigns({ requireConfig = false } = {}) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    if (requireConfig) throw new Error("VAPID keys are not configured");
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("begin");
    const { rows: campaigns } = await client.query(
      `select * from push_campaigns where status = 'scheduled' and scheduled_for <= now()
       order by scheduled_for for update skip locked`,
    );
    for (const campaign of campaigns) {
      await client.query(
        `update push_campaigns set status = 'sending' where id = $1`,
        [campaign.id],
      );
      const { rows: subscriptions } = await client.query(
        `select s.id, s.subscription from push_subscriptions s
         join users u on u.id = s.user_id
         where u.suspended_at is null`,
      );
      console.log(
        `Push campaign ${campaign.id}: sending to ${subscriptions.length} subscriptions`,
      );
      let delivered = 0;
      let failed = 0;
      for (const subscription of subscriptions) {
        try {
          await webpush.sendNotification(
            subscription.subscription,
            JSON.stringify({
              title: campaign.title,
              body: campaign.body,
              url: "/",
            }),
            {
              timeout: pushTimeoutMs,
              TTL: 60 * 60,
            },
          );
          delivered += 1;
        } catch (error) {
          failed += 1;
          console.error(
            `Push campaign ${campaign.id}: subscription ${subscription.id} failed`,
            {
              statusCode: error.statusCode,
              message: error.message,
            },
          );
          if ([404, 410].includes(error.statusCode))
            await client.query("delete from push_subscriptions where id = $1", [
              subscription.id,
            ]);
        }
      }
      await client.query(
        `update push_campaigns set status = 'sent', sent_at = now(), delivery_count = $2, failure_count = $3 where id = $1`,
        [campaign.id, delivered, failed],
      );
      console.log(
        `Push campaign ${campaign.id}: delivered=${delivered}, failed=${failed}`,
      );
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

cron.schedule("* * * * *", () => sendDueCampaigns().catch(console.error));

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

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
  );
  await pool.query(
    "alter table users add column if not exists suspended_at timestamptz null",
  );
  await pool.query(
    "alter table users add column if not exists auth_version integer not null default 0",
  );
  await pool.query(
    `create table if not exists password_reset_codes (
      user_id uuid primary key references users(id) on delete cascade,
      code_hash bytea not null,
      expires_at timestamptz not null,
      requested_at timestamptz not null default now(),
      attempts integer not null default 0
    )`,
  );
  await pool.query(
    "create index if not exists password_reset_codes_expires_at_idx on password_reset_codes (expires_at)",
  );
  await pool.query(
    `create table if not exists registration_codes (
      email text primary key,
      code_hash bytea not null,
      expires_at timestamptz not null,
      requested_at timestamptz not null default now(),
      attempts integer not null default 0,
      verified_at timestamptz
    )`,
  );
  await pool.query(
    "create index if not exists registration_codes_expires_at_idx on registration_codes (expires_at)",
  );
  await pool.query(
    `create table if not exists feedback_messages (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references users(id) on delete set null,
      full_name text not null,
      rating integer not null check (rating between 1 and 5),
      message text not null,
      email_sent_at timestamptz,
      email_error text,
      created_at timestamptz not null default now()
    )`,
  );
  await pool.query(
    "create index if not exists feedback_messages_created_at_idx on feedback_messages (created_at desc)",
  );
  app.listen(port, () => console.log(`API listening on ${port}`));
}

start().catch((error) => {
  console.error("Failed to initialize database:", error);
  process.exit(1);
});
