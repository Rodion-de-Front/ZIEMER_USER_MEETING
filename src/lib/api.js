const baseUrl = import.meta.env.VITE_API_URL || '/api'
const tokenKey = 'ziemer-access-token'

export function getToken() {
  return localStorage.getItem(tokenKey)
}

export function setToken(token) {
  localStorage.setItem(tokenKey, token)
}

export function clearToken() {
  localStorage.removeItem(tokenKey)
}

export async function api(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Ошибка запроса')
    error.code = data.code
    throw error
  }
  return data
}

export async function savePushSubscription(registration) {
  if (!import.meta.env.VITE_VAPID_PUBLIC_KEY) throw new Error('VAPID-ключ не настроен')
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
  })
  await api('/push/subscribe', { method: 'POST', body: JSON.stringify({ subscription }) })
}
