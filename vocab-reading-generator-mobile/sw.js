/**
 * Service Worker - 单词段落生成工具移动版
 * 提供离线缓存和更快的加载体验
 */

const CACHE_NAME = 'vocab-tool-v1';

// 需要缓存的资源
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/theme.css',
    '/css/popup.css',
    '/css/highlight-button.css',
    '/css/login.css'
];

// 安装时预缓存
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] 预缓存资源');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

// 网络优先，缓存后备
self.addEventListener('fetch', event => {
    // 只缓存同源请求
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // 只缓存成功响应
                    if (response.status === 200) {
                        const cacheClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, cacheClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 离线时从缓存读取
                    return caches.match(event.request);
                })
        );
    }
});
