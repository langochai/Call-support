/*
* Bootstrap 5 Toggle Password
* Author: Rudrian Riener Pariñas
* Description: Toggle password visibility
*/

(function ($) {

    $.fn.togglepassword = function (btnclass) {
        this.each(function(){
            let id = $(this).attr('id') ?? ($(this).attr('name') ?? '');
            let autofocus = $(this).prop('autofocus') !== true ? '' : ' autofocus';
            let name = $(this).attr('name') ?? '';
            let classlist = $(this).attr('class') ?? '';
            let value = $(this).val();
            let content = '<i class="fa-regular fa-eye-slash"></i>';
            let title = 'Show password';
            btnclass = btnclass ?? '';
            return $(this).replaceWith(
                $('<div class="d-flex"></div>')
                    .append($('<input type="password" class="' + classlist + '" id="' + id + '" name="' + name + '" value="' + value + '"' + autofocus + '>'))
                    .append('<button type="button" class="' + btnclass + '" data-role="togglepassword" data-target="#' + id + '" title="' + title + '" tabindex="-1">' + content + '</button>')
            );
        });
    };

})(jQuery);

$(() => {

    $(document).on('click', '[data-role="togglepassword"]', function () {
        let target = $(this).data('target');
        let is_password = $(target).attr('type') === 'password';
        $(target).attr('type', (is_password ? 'text' : 'password'));
        $(this).html('<i class="fa-regular fa-eye' + (is_password ? '' : '-slash') + '"></i>');
        $(this).attr('title', is_password ? 'Hiển thị mật khẩu' : 'Ẩn mật khẩu');
    });

});
