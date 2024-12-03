var submitRequest
$('form').on('submit', e => {
    e.preventDefault();
    $('.message').removeClass('error-text').text('Vui lòng chờ')
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
            remember: $('#remember_me').prop('checked')
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
})