const baseUrl = ''
$.ajaxSetup({
    beforeSend: function (xhr, options) {
        options.url = baseUrl + options.url;
    }
})