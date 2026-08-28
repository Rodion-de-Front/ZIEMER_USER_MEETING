import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'

self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const notification = {
    title: data.title ?? 'ZIEMER USER MEETING',
    body: data.body ?? '',
    url: data.url ?? '/',
  }
  event.waitUntil(Promise.all([
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: { url: notification.url },
    }),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => clients.forEach((client) => client.postMessage({ type: 'push-received', notification }))),
  ]))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})
