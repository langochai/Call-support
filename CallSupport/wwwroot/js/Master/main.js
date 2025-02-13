$(async () => {
    await displayTools()
    $('#tools').searchInput(displayTools, 200)
    $('.btn-add').on('click', () => openModal())
    await loadDepartments();
    await loadLinecodes();
    await loadDateInput();
    await loadRepairStatus();
    await loadHistoryData();
    $('.refresh-history').on('click', loadHistoryData)
    $('.export-excel').on('click', exportExcel)
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
function openModal(data = {}) {
    $('#modal_title').text($.isEmptyObject(data) ? 'Thêm dụng cụ' : 'Thông tin dụng cụ')
    $('#input_name,#input_file').val('')
    $('.preview').empty()
    $('.btn-delete').hide()
    if (!$.isEmptyObject(data)) {
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
async function loadLinecodes() {
    const linesData = await getAllLines()
    $('#lines').empty()
    linesData.forEach(l => {
        const option = $(`<option value="${l.LineC}">${l.LineC}-${l.LineNm}</option>`)
        $('#lines').append(option)
    })
    $('#lines').bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Tất cả',
        dropDownListHeight: 300,
        //debug: true,
        showSelectionAsList: true,
    })
}
async function loadDepartments() {
    const departments = await getAllDepartments()
    $('#from_department,#to_department').empty()
    $('#from_department,#to_department').append($(`<option value='all'>Tất cả</option>`))
    departments.forEach(d => {
        const option = $(`<option value="${d.DepC}">${d.DepC} - ${d.DepNm}</option>`)
        $('#from_department,#to_department').append(option)
    })
    $('#from_department,#to_department').bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Chọn bộ phận',
        dropDownListHeight: 300,
        //debug: true,
    })
}
function loadDateInput() {
    $('#from_date').each(function () {
        let date = new Date();
        date.setDate(date.getDate() - 1);
        this.valueAsDate = date;
    });
    $('#to_date').each(function () {
        this.valueAsDate = new Date();
    });
    $('input[type="date"]').on('change', function () {
        if (!this.value) this.valueAsDate = new Date();
        loadHistoryData()
    });
}
async function loadRepairStatus() {
    $('#repair_status').bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Tất cả',
        dropDownListHeight: 300,
        showSelectionAsList: true,
    })
}
async function loadHistoryData() {
    try {
        const fromDate = $('#from_date').val()
        const toDate = $('#to_date').val()
        const fromDep = $('#from_department').val()
        const toDep = $('#to_department').val()
        const lines = $('#lines').val().join(',')
        const status = $('#repair_status').val().join(',')
        iziToast.success({ title: "Loading...", message: "Đang tải dữ liệu", position: 'topRight', displayMode: 'once', timeout: 30000 })
        const data = await getHistory(fromDate, toDate, fromDep, toDep, lines, status)
        const tbody = $('tbody')
        tbody.empty()
        data.forEach(d => {
            const lineStoppedClass = d.Status_line ? ('line-stop') : '';
            const row = $(`<tr class="${getRowClassName(d.Status_calling)} display-row"></tr>`)
            row.append($(`<td class="text-wrap text-break">${d.Line_c}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.Line_nm}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.Sec_nm}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.Pos_nm}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.ToDep_c}</td>`))
            row.append($(`<td class="text-wrap text-break ${lineStoppedClass}">${d.tenloi}</td>`))
            row.append($(`<td class="text-wrap text-break">${toVNDateTime(d.Calling_time)}</td>`))
            row.data('data', d)
            tbody.append(row)
        })
    }
    catch (err) {
        console.error(err)
        iziToast.error({ title: "Lỗi", message: "Load dữ liệu thất bại", position: 'topRight', displayMode: 'once', timeout: 30000 })
    }
    finally {
        var toast = document.querySelector('.iziToast');
        iziToast.hide({}, toast);
    }
}
function getRowClassName(statusCalling, confirmTime) {
    if (statusCalling == 0) return "waiting"
    if (statusCalling == 1 && !confirmTime) return "repairing"
    if (statusCalling == 1 && confirmTime) return "finished"
    if (statusCalling == 2) return "confirmed"
}
async function exportExcel() {
    let fromDate = $('#from_date').val()
    let toDate = $('#to_date').val()
    let fromDep = $('#from_department').val()
    let toDep = $('#to_department').val()
    let lines = $('#lines').val().join(',')
    let status = $('#repair_status').val().join(',')
    if (fromDep == 'all') fromDep = ''
    if (toDep == 'all') toDep = ''
    iziToast.show({
        color: 'green',
        id: 'toast_download',
        message: 'Đang tải xuống...',
        close: false,
        closeOnEscape: false,
        closeOnClick: false,
        displayMode: 'once',
        position: 'topRight',
        progressBar: false,
        timeout: 1000000,
    })
    const toast = document.querySelector('#toast_download')
    const a = document.createElement('a');
    fetch(`/Master/ExportExcel?fromDate=${fromDate}&toDate=${toDate}&fromDep=${fromDep}&toDep=${toDep}&lines=${lines}&status=${status}`)
        .then(async response => {
            if (!response.ok) {
                const text = await response.text()
                throw new Error(text)
            }
            let filename = `Lịch sử gọi ${toVNDateTime().slice(-10).replaceAll('/','-')}.xlsx`; // Default filename
            a.download = filename;
            return response.blob();
        })
        .then(blob => {
            iziToast.hide({}, toast);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        })
        .catch(err => {
            console.error(err);
            iziToast.error({ title: err.message ?? 'Đã có lỗi xảy ra, vui lòng thử lại', position: 'topRight' });
            iziToast.hide({}, toast);
        });
}