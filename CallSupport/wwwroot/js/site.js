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
$('.fa-qrcode').closest('li').on('click', function () {
    $('#login_qrcode').empty()
    $.get({
        url: `/Login/QRcode`,
        success: function (data) {
            new QRCode(document.getElementById("login_qrcode"), {
                text: JSON.stringify(data),
                width: 200,
                height: 200,
            });
        },
        err: function (err) {
            console.error(err)
            
        }
    })
})
$('#save_login_qr').on('click', function () {
    var imgSrc = $('#login_qrcode img:first').attr('src');
    var img = new Image();
    img.src = imgSrc;
    img.onload = function () {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var borderSize = 20;

        canvas.width = img.width + 2 * borderSize;
        canvas.height = img.height + 2 * borderSize;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, borderSize, borderSize);
        canvas.toBlob(function (blob) {
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'qr-code.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        })
    }
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