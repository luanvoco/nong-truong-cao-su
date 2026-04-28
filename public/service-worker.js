/**
 * SERVICE WORKER v4.1 - VRG Group Edition
 * Vị trí: public/service-worker.js
 * Chức năng: Lưu trữ mã nguồn vào máy để chạy Offline 100%
 */

const CACHE_NAME = 'vrg-group-offline-v4.1';
const OFFLINE_URL = '/index.html';

// Danh sách linh kiện cần "nhập kho" ngay lần đầu có mạng
const assetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  'https://cdn.tailwindcss.com' 
];

// 1. Giai đoạn Install: Tải dữ liệu vào bộ nhớ đệm (Cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('VRG Group SW: Đang nhập kho dữ liệu...');
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// 2. Giai đoạn Activate: Dọn dẹp các phiên bản cũ để cập nhật bản mới
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('VRG Group SW: Đang dọn dẹp kho cũ:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Giai đoạn Fetch: Đánh chặn yêu cầu và lấy dữ liệu từ máy ra chạy (Offline Support)
self.addEventListener('fetch', (event) => {
  // Xử lý khi mở trang (Navigation)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Xử lý các file tĩnh khác
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
