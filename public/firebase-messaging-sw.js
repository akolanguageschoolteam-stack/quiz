self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        return;
    }
    const notification = payload.notification || {};
    const data = payload.data || {};
    const title = notification.title;
    const options = {
        body: notification.body,
        icon: notification.icon || data.image || '/favicon.ico',
        data: { url: data.url || data.click_action || '/' },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : '/';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
            for (const client of clientsList) {
                const clientUrl = new URL(client.url);
                if (clientUrl.origin === self.location.origin && 'focus' in client) {
                    client.focus();
                    if ('navigate' in client) {
                        return client.navigate(targetUrl);
                    }
                    return;
                }
            }
            return self.clients.openWindow(targetUrl);
        })
    );
});
