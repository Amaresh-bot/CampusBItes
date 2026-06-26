// Service Worker for native background Push Notifications
self.addEventListener('push', function(event) {
  let data = { title: 'CampusBites Notification', body: 'Your preparation is complete!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'CampusBites Notification', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    data: data.data || {},
    actions: [
      { action: 'open', title: 'Open CampusBites' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
            break;
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
