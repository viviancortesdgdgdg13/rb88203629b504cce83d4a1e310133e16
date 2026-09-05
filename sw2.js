const cacheName = "1788626288727"; // this gets replaced by the build script

self.addEventListener("install", (e) => {
  console.log("[Service Worker] Install", cacheName);
  e.waitUntil(self.skipWaiting());
});
self.addEventListener("message", (e) => {
  if (e.data.update) self.skipWaiting();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(e.request, { cache: "no-store" });
      if (response.ok) await cache.put(e.request, response.clone());
      return response;
    } catch {
      const cached = await cache.match(e.request);
      if (cached) return cached;
      throw new Error(`No network or cached response for ${url.href}`);
    }
  })());
});
self.addEventListener("activate", (e) => {
  e.waitUntil(Promise.all([
    caches.keys().then((keys) => Promise.all(keys.map((key) => key === cacheName ? undefined : caches.delete(key)))),
    self.clients.claim(),
  ]));
});
