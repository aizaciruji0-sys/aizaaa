// Service worker untuk APEX: app shell tetap bisa dibuka saat offline.
// Taruh di folder yang sama dengan file HTML (mis. index.html) dan sajikan lewat HTTPS.
const C = 'apex-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;                       // POST sync tidak pernah di-cache
  if (new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(r)
      .then(res => {
        if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
        return res;
      })
      .catch(() =>
        caches.match(r, { ignoreSearch: true }).then(m => m || (r.mode === 'navigate' ? caches.match('./') : Response.error()))
      )
  );
});
