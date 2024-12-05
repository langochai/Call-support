$(() => {
    loadData('#positions', getPositions, ['PosC', 'PosNm'])
    loadData('#lines', getLines, ['LineC', 'LineNm'])
    loadData('#sections', getSections, ['SecC', 'SecNm'])
    loadData('#departments', getDepartments, ['DepC', 'DepNm'])
    loadData('#defects', getDefects, ['Maloi', 'Tenloi'])
    createCarousel()
})
// Load data ***********************************************
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
// **********************************************************
function createCarousel() {
    let currentIndex = 0;
    const $currentImgDiv = $('.current-img');

    function updateCarousel() {
        const images = $currentImgDiv.find('img')
        images.removeClass('active')
        images.eq(currentIndex).addClass('active')
        $('#current_page').text(currentIndex < 0 ? 1 : images.length > 0 ? currentIndex + 1 : 0)
        $('#max_page').text(images.length)
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
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = 'Selected Image';
                img.classList.add('mx-auto')
                $currentImgDiv.append(img)
                currentIndex = $currentImgDiv.find('img').length - 1
                updateCarousel()
                $('#defect_img').val('')
            };
            reader.readAsDataURL(file);
        }
    })
    updateCarousel()
    $(window).on('resize', function () {
        updateCarousel();
    });
}