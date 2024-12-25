$(async () => {
    await displayTools()
    $('#tools').searchInput(displayTools, 200)
    $('.btn-add').on('click', () => openModal())
    displaySidebar()
})
async function displayTools() {
    try {
        const search = $('#tools').val()?.trim();
        const data = await getTools(search);
        const $display = $('#tools-display')
        $display.find('.tools-options').not('.picked-tool').remove()
        let pickedToolIds = $display.find('.tools-options.picked-tool').map(function () { return $(this).data('tool-id'); }).get();
        data
            .filter(d => !pickedToolIds.includes(d.Id))
            .forEach(d => {
                const $tool = $(
                    `<div class="col-6 col-md-3 col-lg-2 border bg-light tools-options" >
                        <div class="border my-1 mx-auto" style="width:80%;height:60%">
                            <img class="w-100 h-100" src="${d.Img}" />
                        </div>
                        <div class="mx-auto mt-3 text-center">${d.ToolNm}</div>
                    </div>`
                )
                $tool.data('data', d)
                $tool.on('click', () => openModal(d))
                $display.append($tool)
            })
    }
    catch (e) {
        iziToast.error({ title: 'Lỗi', message: 'Load dữ liệu công cụ thất bại', position: 'topRight', displayMode: 'replace' })
    }
}
function displaySidebar() {
    const $ul = $('#navigation-list')
    $ul.empty()
    $ul.off('click').on('click', 'li', () => { $('#backdrop').trigger('click') })
}
function openModal(data = {}) {
    $('#modal_title').text($.isEmptyObject(data) ? 'Thêm dụng cụ' : 'Thông tin dụng cụ')
    $('#input_name,#input_file').val('')
    $('.preview').empty()
    $('.btn-delete').hide()
    if (!$.isEmptyObject(data)) {
        console.log(data);
        $('#input_name').val(data.ToolNm).data('tool-id', data.Id)
        $('.preview').append(`<img src="${data.Img}" class="w-100">`)
        $('.btn-delete').show()
    }
    $('#modal_input').modal('show')
}
function validateModal() {
    let isOK = true
    if (!$('#input_name').val()) {
        iziToast.error({ tittle: 'Lỗi', message: 'Vui lòng nhập tên dụng cụ', position: 'topRight', displayMode: 'replace' })
        isOK = false
    }
    if (!$('.preview img').length) {
        iziToast.error({ tittle: 'Lỗi', message: 'Vui lòng nhập ảnh dụng cụ', position: 'topRight', displayMode: 'replace' })
        isOK = false
    }
    return isOK
}
function getImage(img) {
    return new Promise((resolve, reject) => {
        const $img = $(img)
        fetch($img.attr('src'))
            .then(response => response.blob())
            .then(blob => {
                resolve(blob)
            })
            .catch(error => { reject(error) });
    })
}
$('#input_file').on('change', function (e) {
    $('.preview').empty()
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.classList.add('w-100')
        $('.preview').append(img)
        $('#input_file').val('')
    } else {
        iziToast.error({ tittle: 'Lỗi', message: 'File không hợp lệ', position: 'topRight', displayMode: 'replace' })
    }
})
$('.btn-save').on('click', async function () {
    if (!validateModal()) return;
    try {
        const toolID = $('#input_name').data('tool-id')
        const toolName = $('#input_name').val()
        const toolIMG = await getImage('.preview img')
        const formData = new FormData();
        var fileType = toolIMG.type.split('/')[1];
        formData.append('name', toolName);
        formData.append('file', toolIMG, `${toolName}-${Date.parse(new Date())}.${fileType}`);
        console.log(toolIMG);
        if (!toolID) {
            $.post({
                url: `/Tools/Create`,
                data: formData,
                processData: false,
                contentType: false,
                success: () => {
                    iziToast.success({ tittle: 'Thông báo', message: 'Thêm dụng cụ thành công', position: 'topRight', displayMode: 'replace' })
                    displayTools()
                },
                error: err => {
                    iziToast.error({ tittle: 'Lỗi', message: err.responseText, position: 'topRight', displayMode: 'replace' })
                }
            })
        } else {
            formData.append('id', toolID);
            $.post({
                url: `/Tools/Update`,
                data: formData,
                processData: false,
                contentType: false,
                success: () => {
                    iziToast.success({ tittle: 'Thông báo', message: 'Cập nhật dụng cụ thành công', position: 'topRight', displayMode: 'replace' })
                    displayTools()
                },
                error: err => {
                    iziToast.error({ tittle: 'Lỗi', message: err.responseText, position: 'topRight', displayMode: 'replace' })
                }
            })
        }
    }
    catch (err) {
        console.error(err)
    }
    finally {
        $('#modal_input').modal('hide')
    }
})
$('.btn-delete').on('click', function () {
    const isConfirmed = confirm('Bạn có chắc chắn xóa dụng cụ này không?')
    if (!isConfirmed) return;
    const toolID = $('#input_name').data('tool-id')
    $.ajax({
        url: `/Tools/Delete?id=${toolID}`,
        method: 'DELETE',
        success: () => {
            iziToast.success({ tittle: 'Thông báo', message: 'Xóa dụng cụ thành công', position: 'topRight', displayMode: 'replace' })
            displayTools()
        },
        error: err => {
            iziToast.error({ tittle: 'Lỗi', message: err.responseText, position: 'topRight', displayMode: 'replace' })
        }
    })
    $('#modal_input').modal('hide')
})