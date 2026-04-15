/**
 * Service Worker — La Carte des Maraudeurs
 * Stratégie :
 *   - Assets statiques  → Cache First (mise en cache longue durée)
 *   - Pages / API       → Network First avec fallback cache
 *   - Hors-ligne        → page /offline servie depuis le cache
 */

const CACHE_NAME = "cdm-v3";
const OFFLINE_URL = "/offline";

// Ressources pré-cachées à l'installation
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET et les extensions de navigateur
  if (request.method !== "GET" || !url.protocol.startsWith("http")) return;

  // Assets statiques (images, JS, CSS, fonts) → Cache First
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?|css)$/) ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API maraudes → Network First, fallback cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Pages de navigation → Network First, fallback offline
  if (request.mode === "navigate") {
    event.respondWith(navigateFetch(request));
    return;
  }
});

// ── Stratégies ────────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? new Response(JSON.stringify({ error: "offline" }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function navigateFetch(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match(OFFLINE_URL) ?? new Response("Hors-ligne", { status: 503 });
  }
}

// ── Push Notifications ────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Carte des Maraudeurs", {
      body: data.body ?? "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const target = event.notification.data?.url ?? "/";
        for (const client of clientList) {
          if (client.url === target && "focus" in client) return client.focus();
        }
        return clients.openWindow(target);
      })
  );
});
