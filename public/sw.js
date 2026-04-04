// Service worker disabilitato temporaneamente
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())
