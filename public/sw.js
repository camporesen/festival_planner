const CACHE_NAME = 'stageside-v1'

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/festivals',
  '/profile',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Non cachare richieste auth Supabase
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/auth/')) {
    return
  }

  // API Supabase — Network First (prova rete, fallback cache)
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Assets statici — Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/') ||
    url.hostname.includes('scdn.co')
  ) {
    event.respondWith(
      caches.match(request).then(cached => cached ?? fetch(request).then(response => {
        caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
        return response
      }))
    )
    return
  }

  // Pagine — Network First con fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
          return response
        })
        .catch(() => caches.match(request) ?? caches.match('/dashboard'))
    )
    return
  }
})