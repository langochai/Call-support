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
$('[type="password"]').togglepassword('btn');
$('header .dropdown').on('click', () => $('#toggle-side-bar').prop('checked', false).trigger('change'))
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
$('#save_changed_password').on('click', function () {
    const oldPassword = $('#old_password').val()
    const newPassword = $('#new_password').val()
    $.post({
        url: `/Login/ChangePassword`,
        data: { oldPassword, newPassword },
        success: () => {
            iziToast.success({
                title: 'Thông báo',
                message: 'Thay đổi mật khẩu thành công<br>Vul lòng đăng nhập lại',
                position: 'topRight',
                progressBar: false,
            })
            localStorage.clear();
            setTimeout(() => window.location.href = `/Login/Logout`, 1500)
        },
        error: err => iziToast.error({
            title: 'Lỗi',
            message: err.responseText.length < 200 ? err.responseText.length : "Lỗi hệ thống",
            position: 'topRight'
        }),
    })
})
$('#backdrop').on('click', () => $('#toggle-side-bar').trigger('change'));
(function ($) {
    $.fn.searchInput = function (callback, timeout = 200) {
        let typingTimer;
        let currentRequest;
        this.on('keyup.searchInput', function () {
            clearTimeout(typingTimer);
            if (currentRequest) {
                currentRequest.abort();
            }
            typingTimer = setTimeout(doneTyping, timeout, $(this));
        });
        this.on('keydown.searchInput', function () {
            clearTimeout(typingTimer);
        });
        function doneTyping() {
            callback();
        }
        const cleanup = () => {
            clearTimeout(typingTimer);
            if (currentRequest) {
                currentRequest.abort();
            }
            this.off('.searchInput');
        };
        this.data('cleanup', cleanup);

        return this;
    };
}(jQuery));
/**
 * Convert to Vietnamese datetime
 * @param {string} dateTimeStr Input string
 * @returns {string} Datetime formated string
 */
function toVNDateTime(dateTimeStr) {
    const date = !dateTimeStr ? new Date() : new Date(dateTimeStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getFullYear();

    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}
