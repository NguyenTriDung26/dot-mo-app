/**
 * Người đưa tin của app Đốt Mỡ — chạy nền trong trình duyệt, kể cả khi app đã đóng.
 *
 * Dũng chốt 23/09: "có tin nhắn trong nhóm phải báo về cho học viên như messenger".
 * Máy chủ bắn tin tới đây, chỗ này dựng thông báo lên màn hình khoá.
 *
 * KHÔNG để service worker này nhớ đệm trang (cache) — app đổi nhiều lần mỗi ngày,
 * đệm sai là học viên dùng bản cũ mà không biết. Nó chỉ làm đúng một việc: nhận tin.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { noiDung: e.data ? e.data.text() : '' }; }

  const tieuDe = d.tieuDe || 'Đốt Mỡ 6 Tuần';
  const tuyChon = {
    body: d.noiDung || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    // Cùng một nhãn thì tin mới đè tin cũ, không dồn đống thông báo trên màn hình khoá
    tag: d.nhan || 'dotmo',
    renotify: true,
    data: { duongDan: d.duongDan || '/' },
    // Rung nhẹ hai nhịp — đủ để biết có tin, không giật mình
    vibrate: [90, 50, 90],
  };
  e.waitUntil(self.registration.showNotification(tieuDe, tuyChon));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const dich = (e.notification.data && e.notification.data.duongDan) || '/';
  e.waitUntil((async () => {
    const cua = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // App đang mở sẵn ở đâu đó thì nhảy vào cửa sổ đó, đừng mở thêm tab mới
    for (const c of cua) {
      if ('focus' in c) { await c.focus(); if ('navigate' in c && dich !== '/') { try { await c.navigate(dich); } catch (err) {} } return; }
    }
    if (self.clients.openWindow) await self.clients.openWindow(dich);
  })());
});
