document.addEventListener('DOMContentLoaded', function () {
    const swipeArea = document.body;
    const toggleSidebar = document.getElementById('toggle-side-bar');
    let startX, startY, endX, endY;
    const minSwipeDistance = 150;

    swipeArea.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    });

    swipeArea.addEventListener('touchmove', function (e) {
        endX = e.touches[0].clientX;
        endY = e.touches[0].clientY;
    });

    swipeArea.addEventListener('touchend', function (e) {
        var deltaX = endX - startX;
        var deltaY = endY - startY;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right
                    toggleSidebar.checked = true;
                } else {
                    // Swipe left
                    toggleSidebar.checked = false;
                }
                const event = new Event('change');
                toggleSidebar.dispatchEvent(event);
            }
        }
    });
});
