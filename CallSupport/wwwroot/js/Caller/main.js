$(() => {
    loadData('#positions', getPositions, ['PosC', 'PosNm'])
    loadData('#lines', getLines, ['LineC', 'LineNm'])
    loadData('#sections', getSections, ['SecC', 'SecNm'])
    loadData('#departments', getDepartments, ['DepC', 'DepNm'])
    loadData('#defects', getDefects, ['Maloi', 'Tenloi'])
    createCarousel()
    displayTools()
    $('#tools').on('input', displayTools)
    $('#tools-display').on('click', '.tools-options', function () {$(this).toggleClass('picked-tool')} )
    insertImageButton()
    pickOptionOnTable()
    $('.footer .btn').on('click', submitData)
})
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
function createCarousel() {
    let currentIndex = 0;
    const $currentImgDiv = $('.current-img');

    function updateCarousel() {
        const images = $currentImgDiv.find('img')
        images.removeClass('active')
        images.eq(currentIndex).addClass('active')
        $('#current_page').text(currentIndex < 0 ? 1 : images.length > 0 ? currentIndex + 1 : 0)
        $('#max_page').text(images.length)
        if (images.length > 0) $('.delete-img').show()
        else $('.delete-img').hide()
    }

    $('.prev-img').on('click', function () {
        const totalImages = $currentImgDiv.find('img').length
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : totalImages - 1;
        updateCarousel();
    });

    $('.next-img').on('click', function () {
        const totalImages = $currentImgDiv.find('img').length
        currentIndex = (currentIndex < totalImages - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });
    $('.delete-img').on('click', function () {
        $currentImgDiv.find('img').eq(currentIndex).remove()
        if (currentIndex > 0) currentIndex--
        updateCarousel()
    })
    $('#defect_img').on('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            //const reader = new FileReader();  //// this works fine but I don't like it, got some overheads
            //reader.onload = function (e) {
            //    const img = document.createElement('img');
            //    img.src = e.target.result;
            //    img.alt = 'Selected Image';
            //    img.classList.add('mx-auto')
            //    $currentImgDiv.append(img)
            //    currentIndex = $currentImgDiv.find('img').length - 1
            //    updateCarousel()
            //    $('#defect_img').val('')
            //};
            //reader.readAsDataURL(file);
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = 'Selected Image';
            img.classList.add('mx-auto')
            $currentImgDiv.append(img)
            currentIndex = $currentImgDiv.find('img').length - 1
            updateCarousel()
            $('#defect_img').val('')
        }
    })
    $('.current-img').on('click', 'img', function () {
        convertIMG(this, '/Images/Defect')
        //const img = this;
        //if (img.requestFullscreen) {
        //    img.requestFullscreen();
        //} else if (img.mozRequestFullScreen) { // Firefox
        //    img.mozRequestFullScreen();
        //} else if (img.webkitRequestFullscreen) { // Chrome, Safari and Opera
        //    img.webkitRequestFullscreen();
        //} else if (img.msRequestFullscreen) { // IE/Edge
        //    img.msRequestFullscreen();
        //}
    })
    updateCarousel()
    $(window).on('resize', function () {
        updateCarousel();
    });
}
async function displayTools() {
    const search = $('#tools').val()?.trim()
    $('#tools-display').empty()
    const data = await getTools(search)
    if (!data.length) return;
    data.forEach(d => {
        const $tool = $(
            `<div class="col-6 col-md-3 col-lg-2 border bg-light tools-options" style="height:160px">
                <div class="border my-1 mx-auto" style="width:80%;height:60%">
                    <img class="w-100 h-100" src="${d.Img}" />
                </div>
                <div class="mx-auto mt-3 text-center">${d.ToolNm}</div>
            </div>`
        )
        $tool.data('tool-id', d.Id)
        $('#tools-display').append($tool)
    })
}
function insertImageButton() {
    $('.img-input').on('click', '.input-option', function (e) {
        if ($(this).text() == 'Chọn') {
            $('#defect_img').removeAttr('capture')
        } else {
            $('#defect_img').attr('capture', 'enviroment')
        }
        $('#defect_img').trigger('click')
    })
}
function pickOptionOnTable() {
    $('.table').on('click', 'tbody tr', function () {
        $(this).addClass('active-row').siblings().removeClass('active-row')
    })
}
function validateData() {
    let isVeryVeryOK = true
    let hasSelected = $('.table tbody tr').filter(function () {
        return $(this).hasClass('active-row')
    }).length > 0
    let hasImg = $('.current-img img').length > 0
    if (!hasSelected) {
        iziToast.warning({ title: 'Thông báo', message: 'Vui lòng điền đủ thông tin', displayMode: 1, position: 'topRight' })
        isVeryVeryOK = false
    }
    if (!hasImg) {
        iziToast.warning({ title: 'Thông báo', message: 'Vui lòng chụp ảnh lỗi', displayMode: 1, position: 'topRight' })
        isVeryVeryOK = false
    }
    return isVeryVeryOK
}
async function submitData() {
    if (!validateData()) return
    const data =
    {
        CallerC : $('#UserName').val(),
        DepC : $('#Department').val(),
        LineC : $('#lines').parent().next().find('tbody tr[class="active-row"] td:first').text(),
        SecC : $('#sections').parent().next().find('tbody tr[class="active-row"] td:first').text(),
        PosC : $('#positions').parent().next().find('tbody tr[class="active-row"] td:first').text(),
        ToDepC : $('#departments').parent().next().find('tbody tr[class="active-row"] td:first').text(),
        ErrC : $('#defects').parent().next().find('tbody tr[class="active-row"] td:first').text(),
        StatusLine : $('.footer .btn').index(this).toString(),
    }
    await createCall(data)
}