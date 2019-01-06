/// <reference path="./types/service-worker.d.ts" />

self.addEventListener('install', (e) => e.waitUntil((async () => {

  console.log('[ServiceWorker] Installed');

})()));

self.addEventListener('activate', (e) => e.waitUntil((async () => {

  console.log('[ServiceWorker] Activated');

  // Take over responsibility

  // Immediately grab clients and start handling fetches
  await clients.claim();

  // Don't wait for old server worker to shutdown. Instantly take over responsibility for serving requests
  skipWaiting();

  // Cache critical assets

  const CacheName = 'http://localhost:8765/'
  
  const Assets = ['/src/app.js', '/assets/index.css']

  // Open the cache
  const cache = await caches.open(CacheName);

  // Add essential files like our app's assets to the cache
  console.log('[ServiceWorker] Caching cacheFiles');

  await cache.addAll(Assets);

})()));

self.addEventListener('fetch', (e) => e.respondWith((async () => {

  console.log('[ServiceWorker] Fetch:', e.request.url);

  // Check in cache for the request being made
  //const cachedResponse = await caches.match(e.request);

  // If the request is in the cache
  /*if (cachedResponse) {
      // Return the cached version
      console.log('[ServiceWorker] Found in Caches:', e.request.url);

      return cachedResponse;
  }*/

  try {
    const response = await fetch(e.request);

    console.log('[ServiceWorker] Sending new response:', e.request.url);
    return response;

  } catch (err) {
    if (e.request.method === 'GET' && e.request.url.endsWith('/todos')) {
        const date = new Date();

        const data = {
            items: [{ id: -1, title: 'Check your internet connection???', complete: false, synced: true }],
            counts: { total: 1, active: 1, completed: 0 },
        };

        const json = JSON.stringify(data);

        return new Response(json, {
            headers: new Headers({
                'content-type': 'application/json',
                'date': date.toUTCString(),
            }),
        });
    }

    throw err;
  }

  //const response = await fetch(e.request);
  //return response;

})()));