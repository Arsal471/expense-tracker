// 🛠️ Service worker — makes the app installable and lets it open without internet.
// Change the version when you want every phone to drop its old cache.
const CACHE = "budget-tracker-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

// 1. Install: save the basic files
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting(); // use the new version straight away
});

// 2. Activate: delete caches from older versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch: decide where each request is answered from
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle our own GET requests (Firebase / Google requests go straight to the internet)
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Pages: try the internet first (to get updates), fall back to the saved copy when offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  // JS / CSS / images: use the saved copy if we have it, otherwise download and save it
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
