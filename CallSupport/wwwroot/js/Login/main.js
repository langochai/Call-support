var submitRequest
$(() => {
    const credentials = localStorage.getItem('credentials');
    if (credentials) {
        $.post({
            url: '/Login/CheckCredentials',
            data: { credentials },
            success: () => window.location.href = "/",
            error: () => window.location.href = "/Home/Error"
        })
    }
    else {
        $('body').css('display', 'block')
    }
    //$('#password').parent().hide()
    $('#login_master').on('change', function () {
        if (this.checked) {
            //$('#password').parent().show()
            $('#remember_me').parent().hide()
        } else {
            //$('#password').parent().hide()
            $('#remember_me').parent().show()
        }
    })
    $('form').on('submit', e => {
        e.preventDefault();
        $('.message').removeClass('error-text').text('Vui lòng chờ')
        if (!$('#username').val() || !$('#password').val()) {
            return $('.message').removeClass('error-text').addClass('error-text').text('Vui lòng nhập tên đăng nhập/mật khẩu')
        }
        $('button[type="submit"]').html(
            `<div class="btn-parts"><i class="fa-solid fa-spinner fa-spin-pulse"></i></div></div>
                <div class="btn-parts">Đang đăng nhập</div>
                <div class="btn-parts"></div>`)
        $('button[type="submit"]').attr('disable', 'true')
        if (submitRequest) return
        submitRequest = $.post({
            url: '/Login',
            data: {
                username: $('#username').val(),
                password: $('#password').val(),
                remember: $('#remember_me').prop('checked'),
                asMaster: $('#login_master').prop('checked'),
            },
            success: data => {
                $('.error-text').fadeOut()
                $('button[type="submit"]')
                    .html(`<div class="btn-parts"></div>
                            <div class="btn-parts middle"><i class="fa-solid fa-check fa-bounce"></i></div>
                            <div class="btn-parts"></div>`)
                if (data) localStorage.setItem("credentials", data)
                window.location.href = "/";
            },
            error: err => {
                err.status == 401 ?
                    $('.message').html(err.responseText) // sai tài khoản hoặc mật khẩu
                    :
                    $('.message').html(err.responseText.substring(0, 50))
                $('.message').addClass('error-text')
                $('button[type="submit"]').html(`<div class="btn-parts"></div>
                                                <div class="btn-parts">Đăng nhập</div>
                                                <div class="btn-parts"></div>`)
                submitRequest = null
            },
            complete: () => {
                $('button[type="submit"]').removeAttr('disable')
            }
        })
    })
    $('#qr_code').on('click', function (e) {
        e.preventDefault()
        const video = document.getElementById("login_qrcode");
        const canvas = document.getElementById("canvas");
        const ctx = canvas.getContext("2d");
        let stream, currentRequest
        async function startVideo() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                video.srcObject = stream;
            } catch (err) {
                console.error("Error accessing camera: ", err);
            }
        }
        function scanQRCode() {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                canvas.height = video.videoHeight;
                canvas.width = video.videoWidth;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code?.data && !currentRequest) {
                    console.log(code?.data)
                    $.post({
                        url: `/Login/QRcodeLogin`,
                        data: JSON.stringify(code.data.substring(1, code.data.length - 1)),
                        contentType: 'application/json',
                        success: () => {
                            //window.location.href = "/";
                        },
                        error: err => {
                            console.error(err)
                            iziToast.warning({
                                title: 'Thông báo',
                                message: 'Xác nhận không thành công',
                                displayMode: 'once',
                                position: 'topRight'
                            })
                        }
                    })
                }
            }
            requestAnimationFrame(scanQRCode);
        }
        //startVideo();
        //scanQRCode();
        $('label.btn-outline-secondary input').off('change').on('change', function (e) {
            const file = e.target?.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.getElementById('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0, img.width, img.height);
                    const imageData = ctx.getImageData(0, 0, img.width, img.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code?.data) {
                        $.post({
                            url: `/Login/QRcodeLogin`,
                            data: JSON.stringify(code.data.substring(1, code.data.length - 1)),
                            contentType: 'application/json',
                            success: () => {
                                window.location.href = "/";
                            },
                            error: err => {
                                console.error(err)
                                iziToast.warning({
                                    title: 'Thông báo',
                                    message: 'Xác nhận không thành công.',
                                    displayMode: 'once',
                                    position: 'topRight'
                                })
                            }
                        })
                    } else {
                        iziToast.warning({
                            title: 'Thông báo',
                            message: 'Mã QR không hợp lệ.',
                            displayMode: 'once',
                            position: 'topRight'
                        })
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        })
    })
})