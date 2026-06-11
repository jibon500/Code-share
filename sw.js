// Service worker for basic caching
const CACHE_NAME = 'code-share-v1';
const ASSETS = [
  '/', '/index.html', '/src/css/style.css', '/index.html', '/admin/index.html'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
});
self.addEventListener('fetch', e=>{
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
