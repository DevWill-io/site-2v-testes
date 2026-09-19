// ==========================================
// SERVICE WORKER — Portal InfoWeb 2V
// ==========================================
const CACHE_NAME = "infoweb-2v-v1";
const ASSETS_CACHE = [
  "/",
  "/login.html",
  "/index.html",
  "/styles/login.css",
  "/styles/style.css",
  "/scripts/login.js",
  "/scripts/script.js",
  "/manifest.json",
];

// Instala → pré-cacheia os assets principais
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_CACHE).catch((err) => {
        console.warn("[SW] Falha ao cachear alguns assets:", err);
      });
    })
  );
});

// Ativa → limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch → network-first com fallback pro cache
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora métodos não-GET
  if (request.method !== "GET") return;

  // Ignora requests pra SUAP, Firebase, Google APIs, CDN de terceiros
  const dominiosIgnorados = [
    "suap.ifrn.edu.br",
    "firebaseio.com",
    "googleapis.com",
    "gstatic.com",
    "google.com",
    "cdn.jsdelivr.net",
    "cdnjs.cloudflare.com",
    "ui-avatars.com",
  ];
  if (dominiosIgnorados.some((d) => url.hostname.includes(d))) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Guarda uma cópia no cache
        if (response && response.status === 200 && response.type === "basic") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});