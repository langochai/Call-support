self.addEventListener('push', function (event) {
    const options = event.data ? event.data.json() : {};
    event.waitUntil(
        self.registration.showNotification(options.title || "Notification", options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Close notification when clicked
    event.waitUntil(
        clients.matchAll({ type: "window" }).then(clientList => {
            if (clientList.length > 0) {
                clientList[0].focus(); // Bring back the first open tab
            } else {
                clients.openWindow('/'); // Open a new tab if no open tab exists
            }
        })
    );
});
