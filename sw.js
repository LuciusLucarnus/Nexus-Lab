const CACHE = 'nexus-lab-v18';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './impressum.html',
  './datenschutz.html',
  './css/style.css',
  './js/audio.js',
  './js/modes.js',
  './js/core.js',
  './js/perception.js',
  './js/music.js',
  './js/arcade-core.js',
  './js/arcade-games.js',
  './js/atom.js',
  './js/games/pong.js',
  './js/games/gravity.js',
  './js/games/orbit.js',
  './js/games/pinball.js',
  './js/games/pitch.js',
  './js/games/rhythm.js',
  './js/games/flash.js',
  './js/games/reactsplit.js',
  './js/games/periph.js',
  './js/games/odd.js',
  './js/rank.js',
  './js/share.js',
  './js/main.js',
  './js/boot.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(CORE.map(u => fetch(new Request(u, { cache: 'reload' })).then(r => r.ok && c.put(u, r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

// Beim Start einer neuen Version werden alle alten Caches gelöscht.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});

// Eigene Dateien (HTML, JS, CSS, Icons): immer erst Netz (ohne HTTP-Cache), dann Cache -> Updates kommen sofort an, offline läuft es trotzdem.
// Fremde Dateien (Tailwind-CDN, Schriften): erst Cache, dann Netz.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return res; })
        .catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
    if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(() => undefined)));
});
