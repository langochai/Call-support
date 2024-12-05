if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

document.getElementById('notifyButton').addEventListener('click', () => {
    if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Hello!', {
                body: 'You clicked the button!',
                icon: 'icon.png',
                badge: 'badge.png'
            });
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                navigator.serviceWorker.ready.then(registration => {
                    registration.showNotification('Hello!', {
                        body: 'You clicked the button!',
                        icon: 'icon.png',
                        badge: 'badge.png'
                    });
                });
            }
        });
    }
});
