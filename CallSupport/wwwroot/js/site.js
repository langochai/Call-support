$('#logout').on('click', () => {
    localStorage.removeItem('credentials')
});
$('#navbar-btn-toggle-sidebar').on('click', function () {
    $(this).toggleClass('change')
})
$('#toggle-side-bar').on('change', function () {
    const isChecked = this.checked
    if (isChecked) document.getElementById('navbar-btn-toggle-sidebar').classList.add('change')
    else document.getElementById('navbar-btn-toggle-sidebar').classList.remove('change')
})
$('#backdrop').on('click', () => $('#toggle-side-bar').trigger('change'));
(function ($) {
    $.fn.searchInput = function (callback) {
        let typingTimer;
        let currentRequest;
        this.on('keyup.searchInput', function () {
            clearTimeout(typingTimer);
            if (currentRequest) {
                currentRequest.abort();
            }
            typingTimer = setTimeout(doneTyping, 350, $(this));
        });
        this.on('keydown.searchInput', function () {
            clearTimeout(typingTimer);
        });
        function doneTyping() {
            callback();
        }
        this.cleanup = function () {
            clearTimeout(typingTimer);
            if (currentRequest) {
                currentRequest.abort();
            }
            this.off('.searchInput');
        };

        return this;
    };
}(jQuery));