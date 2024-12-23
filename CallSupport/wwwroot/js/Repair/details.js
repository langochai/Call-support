$(async () => {
    createCarousel('#caller_tools')
    createCarousel('#caller_defects')
    createCarousel('#before_repair_img')
    createCarousel('#after_repair_img')
    insertImageButton()
    await loadData('.group-defect', getGroupDefect, ['GroupdefectC', 'GroupdefectNm'])
    await loadData('.detailed-defect', getDetailedDefectOnGroup, ['Maloi', 'Tenloi'])
    pickOptionOnGroupDefect()
    pickOptionOnDetailedDefect()
    $('.btn-receive').on('click', receiveCall)
    $('.btn-repair').on('click', startRepair)
    await loadCallDetails()
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
    if (data.Confirm_c && data.Confirm_time) {
        $('.btn-receive').trigger('click')
        const repairArea = $('.btn-repair').parent().parent().next()
        repairArea.find('.img-input').remove()
        data.BeforeRepairImg?.split(',')?.forEach((bi, i) => {
            const img = $(`<img src="${bi}" />`)
            $('#before_repair_img .current-img').append(img)
        })
        $('#before_repair_img').trigger('change')
        repairArea.show()
        $('.btn-repair').remove()
    }
}
async function getDetailedDefectOnGroup(search, offset) {
    const group = $('.table-detailed-defect').find('tbody tr[class="active-row"] td:first').text()
    if (!group) return [];
    return await getDetailedDefect(group, search, offset)
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
function receiveCall() {
    const beforeRepairArea = $(this).parent().next()
    beforeRepairArea.show()
    $(this).hide()
}
async function startRepair() {
    if (!$('#before_repair_img .current-img img').length) return iziToast.error({
        title: "Lỗi",
        message: "Vui lòng nhập ảnh trước khi sửa",
        position: 'topRight',
        displayMode: 'replace'
    });
    const imgIDs = await Promise.all(
        $('#before_repair_img current-img img').map(async function (index, img) {
            return await convertIMG(img, `/Images/BeforeRepair`, index)
        }).get()
    )
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    const line = urlParams.get('line');
    const section = urlParams.get('section');
    const position = urlParams.get('position');
    await updateCallBeforeRepair(+time, line, section, position, imgIDs)
    const repairArea = $(this).parent().parent().next()
    repairArea.show()
    $(this).hide()
}