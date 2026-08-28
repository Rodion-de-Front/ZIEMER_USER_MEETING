import { useEffect, useState } from 'react'
import { ArrowLeft, Ban, BellRing, Check, Search, Send, Users as UsersIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export function AdminPage() {
  const [users, setUsers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState({ title: '', body: '', scheduledFor: '' })
  const [sending, setSending] = useState(false)
  const [updatingUserId, setUpdatingUserId] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [profiles, pushCampaigns] = await Promise.all([api('/admin/users'), api('/admin/campaigns')])
        setUsers(Array.isArray(profiles.users) ? profiles.users : [])
        setCampaigns(Array.isArray(pushCampaigns.campaigns) ? pushCampaigns.campaigns : [])
      } catch (error) {
        setNotice(error.message)
      }
    }
    load()
  }, [])

  const filteredUsers = (() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return users
    return users.filter((user) => [user.full_name, user.email, user.workplace, user.city, user.phone].some((value) => value?.toLowerCase().includes(needle)))
  })()

  async function sendCampaign(event) {
    event.preventDefault()
    setSending(true)
    setNotice('')
    try {
      const { campaign } = await api('/admin/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          body: form.body,
          scheduledFor: form.scheduledFor ? new Date(form.scheduledFor).toISOString() : undefined,
        }),
      })
      setNotice(form.scheduledFor ? 'Рассылка запланирована.' : 'Push-уведомление отправляется на подписанные устройства.')
      setCampaigns([campaign, ...campaigns])
      setForm({ title: '', body: '', scheduledFor: '' })
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSending(false)
    }
  }

  async function toggleUserBlock(user) {
    const blocked = !user.suspended_at
    setUpdatingUserId(user.id)
    setNotice('')
    try {
      const { user: updatedUser } = await api(`/admin/users/${user.id}/block`, {
        method: 'PATCH',
        body: JSON.stringify({ blocked }),
      })
      setUsers((items) => items.map((item) => item.id === user.id ? { ...item, suspended_at: updatedUser.suspended_at } : item))
      setNotice(blocked ? 'Пользователь заблокирован.' : 'Пользователь разблокирован.')
    } catch (error) {
      setNotice(error.message)
    } finally {
      setUpdatingUserId('')
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-heading">
        <Link className="admin-back" to="/"><ArrowLeft size={18} /> Назад</Link>
        <p className="auth-kicker">АДМИНИСТРИРОВАНИЕ</p>
        <h1>Кабинет администратора</h1>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Разделы кабинета">
        <button className={activeTab === 'users' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'users'} onClick={() => setActiveTab('users')}><UsersIcon size={17} /> Пользователи <span>{users.length}</span></button>
        <button className={activeTab === 'campaigns' ? 'is-active' : ''} type="button" role="tab" aria-selected={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')}><BellRing size={17} /> Рассылки</button>
      </div>
      {activeTab === 'users' ? (
        <section className="admin-panel users-panel admin-tab-content">
          <div className="panel-title"><div><UsersIcon size={19} /><h2>Пользователи</h2></div><strong>{users.length}</strong></div>
          <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск: ФИО, почта, город…" /></label>
          {notice && <p className="form-status" role="status">{notice}</p>}
          <div className="users-table-wrap">
            <table className="users-table">
              <thead><tr><th>Участник</th><th>Место работы</th><th>Город</th><th>Телефон</th><th>Статус</th><th aria-label="Действия" /></tr></thead>
              <tbody>{filteredUsers.map((user) => {
                const isBlocked = Boolean(user.suspended_at)
                const isAdmin = user.role === 'admin'
                return <tr key={user.id}>
                  <td><strong>{user.full_name}</strong><span>{user.email}</span></td>
                  <td>{user.workplace}</td><td>{user.city}</td><td>{user.phone || '—'}</td>
                  <td><span className={`user-status${isBlocked ? ' is-blocked' : ''}`}>{isBlocked ? 'Заблокирован' : 'Активен'}</span></td>
                  <td><button className={`user-block-button${isBlocked ? ' is-blocked' : ''}`} type="button" disabled={isAdmin || updatingUserId === user.id} title={isAdmin ? 'Администраторов нельзя блокировать' : undefined} onClick={() => toggleUserBlock(user)}>
                    {isBlocked ? <><Check size={15} /><span>Разблокировать</span></> : <><Ban size={15} /><span>Заблокировать</span></>}
                  </button></td>
                </tr>
              })}</tbody>
            </table>
            {!filteredUsers.length && <p className="empty-state">Пользователи не найдены.</p>}
          </div>
        </section>
      ) : (
        <section className="admin-panel campaign-panel admin-tab-content">
          <div className="panel-title"><div><BellRing size={19} /><h2>Push-рассылка</h2></div></div>
          <form className="campaign-form" onSubmit={sendCampaign}>
            <label>Заголовок<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength="100" /></label>
            <label>Текст<textarea value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required maxLength="500" rows="4" /></label>
            <label>Время отправки <span>оставьте пустым для отправки сейчас</span><input type="datetime-local" value={form.scheduledFor} onChange={(event) => setForm({ ...form, scheduledFor: event.target.value })} min={new Date().toISOString().slice(0, 16)} /></label>
            {notice && <p className="form-status">{notice}</p>}
            <button className="primary-button" disabled={sending} type="submit"><Send size={16} /> {sending ? 'Сохранение…' : form.scheduledFor ? 'Запланировать' : 'Отправить сейчас'}</button>
          </form>
          <h3 className="campaign-history-title">Последние кампании</h3>
          <div className="campaign-history">{campaigns.map((campaign) => <article key={campaign.id}><strong>{campaign.title}</strong><p>{campaign.body}</p><span>{campaign.status === 'sent' ? `Доставлено: ${campaign.delivery_count}` : campaign.status === 'scheduled' ? 'Запланирована' : campaign.status}</span></article>)}</div>
        </section>
      )}
    </main>
  )
}
