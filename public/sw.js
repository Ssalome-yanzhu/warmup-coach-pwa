// 热身魔法师 — 离线缓存 Service Worker
const CACHE_NAME = 'warmup-coach-v1';

// 安装时预缓存核心资源（页面壳 + API 数据）
const PRECACHE_URLS = [
  '/',
  '/api/sports.json',
  '/api/age-groups.json',
  '/api/routine-manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  // 立即激活，不等待旧 worker
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 请求拦截：缓存优先，网络更新
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // 后台发起网络请求更新缓存
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, clone)
            );
          }
          return response;
        })
        .catch(() => null);

      // 返回缓存（如果有），否则等网络
      return cached || fetchPromise;
    })
  );
});
