const CACHE_NAME = 'budget-cache-V1';


self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
      './',
      'index.html',
      'index.js',
      'style.css',
      './screens/home.inc',
      './screens/create-account.inc',
      './screens/budget-setup.inc',
      './screens/transactions.inc',
      './screens/error.inc',
    ]);
  })());
});

self.addEventListener('fetch', (event) => {
  event.respondwith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    }),
  );
});