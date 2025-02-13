$(async () => {
    createCarousel('#caller_tools')
    createCarousel('#caller_defects')
    createCarousel('#before_repair_img')
    createCarousel('#after_repair_img')
    insertImageButton()
    pickOptionOnGroupDefect()
    pickOptionOnDetailedDefect()
    $('.btn-receive').on('click', receiveCall)
    $('.btn-repair').on('click', startRepair)
    $('.btn-confirm').on('click', endRepair)
    $('#is_stopped_assy,#is_stopped_qa').on('click', switchLineStatus)
    await loadCallDetails()
    await loadData('.group-defect', getGroupDefectCode, ['GroupdefectC', 'GroupdefectNm'])
    await loadData('.detailed-defect', getDetailedDefectOnGroup, ['Maloi', 'Tenloi'])
    onChangeGroupDefect()
})
function createCarousel(wrapperSelector) {
    let currentIndex = 0;
    const $wrapper = $(wrapperSelector);
    const $currentImgDiv = $wrapper.find('.current-img');
    $wrapper.on('change', updateCarousel)
    function updateCarousel() {
        const images = $currentImgDiv.find('img');
        images.removeClass('active');
        images.eq(currentIndex).addClass('active');
        $wrapper.find('.current-page').text(currentIndex < 0 ? 1 : images.length > 0 ? currentIndex + 1 : 0);
        $wrapper.find('.max-page').text(images.length);
        if (images.length > 0) $wrapper.find('.delete-img').show();
        else $wrapper.find('.delete-img').hide();
        if ($wrapper.find('.tool-name').length) $wrapper.find('.tool-name').text(images.eq(currentIndex).attr('data-tool-name'))
    }
    $wrapper.find('.prev-img').on('click', function () {
        const totalImages = $currentImgDiv.find('img').length;
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
        updateCarousel();
    });
    $wrapper.find('.next-img').on('click', function () {
        const totalImages = $currentImgDiv.find('img').length;
        currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });
    $wrapper.find('.delete-img').on('click', function () {
        $currentImgDiv.find('img').eq(currentIndex).remove();
        if (currentIndex > 0) currentIndex--;
        updateCarousel();
    });
    $wrapper.find('.img-input').on('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = 'Selected Image';
            img.classList.add('mx-auto');
            $currentImgDiv.append(img);
            currentIndex = $currentImgDiv.find('img').length - 1;
            updateCarousel();
            $wrapper.find('.img-input').val('');
        }
    });
    updateCarousel();
    $(window).on('resize', function () {
        updateCarousel();
    });
}
function insertImageButton() {
    $('.img-input').on('click', '.input-option', function (e) {
        if ($(this).text() == 'Chọn') {
            $(this).parent().siblings('input').removeAttr('capture')
        } else {
            $(this).parent().siblings('input').attr('capture', 'enviroment')
        }
        $(this).parent().siblings('input').trigger('click')
    })
}
async function loadData(selector, getData, columns) {
    const input = $(selector)
    if (!input.length) return;
    const table = input.parent().next()
    const options = {
        fetchData: async function (rowCount) {
            const search = input.val()
            const data = await getData(search, rowCount)
            return data
        },
        columns: columns
    }
    table.scrollTable(options)
    input.searchInput(function () {
        const tbody = table.find('tbody')
        table.cleanupScrollTable()
        tbody.fadeOut(function () {
            tbody.empty()
            table.scrollTable(options)
            tbody.fadeIn()
        })
    })
}
async function loadCallDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const line = urlParams.get('line');
    const section = urlParams.get('section');
    const position = urlParams.get('position');
    const result = await getHistoryDetails((new Date(+time)).toISOString(), line, section, position)
    if (!result.length) return iziToast.error({
        title: 'Lỗi',
        message: 'Load dữ liệu cuộc gọi thất bại',
        position: 'topRight'
    });
    const data = result[0]
    console.log(data);
    $('.group-defect').data('department', data.ToDep_c)
    $('.position-name').text(data.Pos_nm)
    $('.line-name').text(data.Line_nm)
    $('.section-name').text(data.Sec_nm)
    $('.defect-name').text(data.tenloi)
    const toolNames = data.ToolNames?.split(',')
    data.Tools?.split(',')?.forEach((t, i) => {
        const img = $(`<img src="${t}" data-tool-name="${toolNames[i]}"/>`)
        $('#caller_tools .current-img').append(img)
    })
    $('#caller_tools').trigger('change')
    data.DefectImg?.split(',')?.forEach((di, i) => {
        const img = $(`<img src="${di}" />`)
        $('#caller_defects .current-img').append(img)
    })
    $('#caller_defects').trigger('change')
    $('.defect-note').val(data.defect_note)
    if (data.Rep_c && data.Repairing_time) {
        $('.btn-receive').trigger('click')
        const repairArea = $('.btn-repair').parent().parent().next();
        data.BeforeRepairImg?.split(',')?.forEach((bi, i) => {
            const img = $(`<img src="${bi}" />`)
            $('#before_repair_img .current-img').append(img)
        });
        $('#before_repair_img').trigger('change');
        $('#before_repair_img .img-input').empty().addClass('mb-3');
        $('#before_repair_img .delete-img').remove();
        repairArea.show();
        $('.btn-repair').remove();
    }
    if (data.Confirm_time) {
        $('.table-group-defect').closest('section').remove()
        $('.detailed-defect').attr('disabled', true).removeClass('detailed-defect')
        const [defect] = await getDetailedDefect(data.Err_c1)
        $('.table-detailed-defect tbody').append($(`<tr class="active-row"><td>${defect?.Maloi}</td><td>${defect?.Tenloi}</td></tr>`));
        data.AfterRepairImg.split(',')?.forEach(img => {
            $('#after_repair_img .current-img').append(`<img src="${img}">`)
        })
        $('#after_repair_img').trigger('change')
        $('#after_repair_img .img-input').empty().addClass('mb-3');
        $('#after_repair_img .delete-img').remove();
        $('#is_stopped_assy').prop('checked', !!data.AssyStop).attr('disabled', true)
        $('#is_stopped_qa').prop('checked', !!data.Stopline).attr('disabled', true)
        $('.repairer-note').val(data.repair_note).attr('readonly', true)
    }
}
async function getGroupDefectCode(search, offset) {
    const department = $('.group-defect').data('department')
    return await getGroupDefect(search, offset, department)
}
async function getDetailedDefectOnGroup(search, offset) {
    const group = $('.table-group-defect').find('tbody tr[class="active-row"] td:first').text()
    return await getDetailedDefect(search, offset, group)
}
function onChangeGroupDefect() {
    $('.table-group-defect tbody').on('click', function () {
        $('.detailed-defect').trigger('keyup.searchInput')
    })
}
function pickOptionOnGroupDefect() {
    $('.table-group-defect').on('click', 'tbody tr', function () {
        $(this).addClass('active-row').siblings().removeClass('active-row')
    })
}
function pickOptionOnDetailedDefect() {
    $('.table-detailed-defect').on('click', 'tbody tr', function () {
        let hasSelected = $('.table-group-defect').map(function () {
            return $(this).find('tbody tr').filter(function () {
                return $(this).hasClass('active-row');
            }).length > 0;
        }).get().every(Boolean);
        if (!hasSelected) return false;
        $(this).addClass('active-row').siblings().removeClass('active-row')
    })
}
function switchLineStatus() {
    if ($(this).prop('checked')) $(this).next().text('Dừng chuyền')
    else $(this).next().text('Không dừng chuyền')
}
function receiveCall() {
    const beforeRepairArea = $(this).parent().next()
    beforeRepairArea.show()
    $(this).hide()
}
async function startRepair() {
    //if (!$('#before_repair_img .current-img img').length) return iziToast.error({
    //    title: "Lỗi",
    //    message: "Vui lòng nhập ảnh trước khi sửa",
    //    position: 'topRight',
    //    displayMode: 'replace'
    //});
    $('.btn-repair').addClass('disabled')
    iziToast.success({ title: "Loading", message: "Đang tải dữ liệu...", position: 'topRight', displayMode: 'once', timeout: 30000 })
    const imgIDs = !$('#before_repair_img .current-img img').length ? [] : await Promise.all(
        $('#before_repair_img .current-img img').map(async function (index, img) {
            return await convertIMG(img, `/Images/BeforeRepair`, index)
        }).get()
    )
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const line = urlParams.get('line');
    const section = urlParams.get('section');
    const position = urlParams.get('position');
    await updateCallBeforeRepair(+time, line, section, position, imgIDs.join(','))
    $('#before_repair_img .img-input').empty().addClass('mb-3');
    const repairArea = $(this).parent().parent().next()
    repairArea.show()
    $(this).hide()
    var toast = document.querySelector('.iziToast');
    iziToast.hide({}, toast);
}
async function endRepair() {
    let hasSelected = $('.table-container').map(function () {
        return $(this).find('tbody tr').filter(function () {
            return $(this).hasClass('active-row');
        }).length > 0;
    }).get().every(Boolean);
    if (!hasSelected){
        return iziToast.error({
            title: "Lỗi",
            message: "Vui lòng chọn nhóm/mã lỗi",
            position: 'topRight',
            displayMode: 'replace'
        })
    }
    iziToast.success({ title: "Loading", message: "Đang tải dữ liệu...", position: 'topRight', displayMode: 'once', timeout: 30000 })
    //if (!$('#after_repair_img .current-img img').length) return iziToast.error({
    //    title: "Lỗi",
    //    message: "Vui lòng nhập ảnh trước khi sửa",
    //    position: 'topRight',
    //    displayMode: 'replace'
    //});
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const line = urlParams.get('line');
    const section = urlParams.get('section');
    const position = urlParams.get('position');
    const groupCode = $('.table-group-defect tr.active-row td:first').text()
    const defectCode = $('.table-detailed-defect tr.active-row td:first').text()
    const imgIDs = !$('#after_repair_img .current-img img').length ? [] : await Promise.all(
        $('#after_repair_img .current-img img').map(async function (index, img) {
            return await convertIMG(img, `/Images/AfterRepair`, index)
        }).get()
    )
    const note = $('.repairer-note').val()
    const isStoppedAssy = $('#is_stopped_assy').prop('checked')
    const isStoppedQA = $('#is_stopped_qa').prop('checked')
    const finished = await updateCallAfterRepair(time, line, section, position, groupCode, defectCode, imgIDs, note, isStoppedAssy, isStoppedQA)
    if (!finished) return iziToast.error({
        title: 'Lỗi',
        message: 'Xác nhận không thành công',
        position: 'topRight',
        displayMode: 'replace'
    })
    $('#finalize_modal').modal('show')
    $('.btn-confirm').addClass('disabled')
    var toast = document.querySelector('.iziToast');
    iziToast.hide({}, toast);
}
$('#finalize_modal').on('shown.bs.modal', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const line = urlParams.get('line');
    const section = urlParams.get('section');
    const position = urlParams.get('position');

    const video = document.getElementById("qrcode_scan");
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
                currentRequest = finalizeRepair(time, line, section, position, code.data.substring(1, code.data.length - 1))
                currentRequest.then(() => { window.location.href = "/History/Repair" }, () => { }) // do nothing when rejected since it's caught in ajax call
            }
        }
        requestAnimationFrame(scanQRCode);
    }
    startVideo();
    scanQRCode();
    $('#qrcode_img').off('change').on('change', function (e) {
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
                    currentRequest = finalizeRepair(time, line, section, position, code.data.substring(1, code.data.length - 1))
                    currentRequest.then(() => { window.location.href = "/History/Repair" }, () => { })
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