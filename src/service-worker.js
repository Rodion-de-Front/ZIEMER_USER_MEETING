import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { createHandlerBoundToURL } from 'workbox-precaching'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

self.skipWaiting()
clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

// Fresh navigation when online, with a cached app shell fallback when offline.
registerRoute(({ request }) => request.mode === 'navigate', new NetworkFirst({
  cacheName: 'pages',
  networkTimeoutSeconds: 3,
}))
setCatchHandler(async ({ request, event }) => {
  if (request.destination === 'document') return createHandlerBoundToURL('/index.html')({ event })
  return Response.error()
})

registerRoute(
  ({ request, url }) => request.destination === 'image' || /\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname),
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
)


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
