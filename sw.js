// Offline support: serve the last good copy when the network is weak.
const CACHE = "ssb-desk-v18";
const CORE = ["./", "./index.html", "./programs.json", "./manifest.webmanifest", "./icon-v4-192.png", "./icon-v4-512.png", "./logo-v3.jpg"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !font) return;
  const key = sameOrigin ? url.origin + url.pathname : req.url; // ignore ?t= cache-busters
  e.respondWith(
    fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(key, copy)); } return res; })
      .catch(() => caches.match(key).then((r) => r || caches.match("./index.html")))
  );
});
