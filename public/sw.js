const CACHE_NAME = 'stageside-v1'

self.addEventListener('install', event => {
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

  // Ignora richieste non GET
  if (request.method !== 'GET') return

  // Ignora auth Supabase — sempre online
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/auth/')) return

  // API Supabase — Network First con fallback cache
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(
      fetch(request.clone())
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Asset statici e immagini Spotify — Cache First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.hostname.includes('scdn.co')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request.clone()).then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
          }
          return response
        })
      })
    )
    return
  }

  // Pagine — Network First con fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request.clone())
        .then(response => {
          if (response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }
})
