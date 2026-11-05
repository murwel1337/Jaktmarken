// Jaktmarken – service worker.
// Hämtar alltid från nätet först, så att nya versioner av spelet syns direkt.
// Sparar en kopia som används om man saknar internet när appen startas.
const CACHE = 'jaktmarken-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // Supabase m.m. går direkt till nätet
  const nav = req.mode === 'navigate';
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(nav ? './index.html' : req, copy)); }
        return res;
      })
      .catch(() => caches.match(nav ? './index.html' : req, { ignoreSearch: true }).then(m => m || caches.match('./index.html')))
  );
});
