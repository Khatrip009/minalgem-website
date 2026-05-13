self.addEventListener('push', function(event) {
  const data = event.data?.json() || { title: 'Notification', body: '' };
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/logo_minalgems.png',
    data: { url: data.data?.url || '/' }
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});