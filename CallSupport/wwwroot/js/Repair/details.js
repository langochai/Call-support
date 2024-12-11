$(() => {
    createCarousel('#caller_tools')
    createCarousel('#caller_defects')
    createCarousel('#before_repair_img')
    createCarousel('#after_repair_img')
})
function createCarousel(wrapperSelector) {
    let currentIndex = 0;
    const $wrapper = $(wrapperSelector);
    const $currentImgDiv = $wrapper.find('.current-img');

    function updateCarousel() {
        const images = $currentImgDiv.find('img');
        images.removeClass('active');
        images.eq(currentIndex).addClass('active');
        $wrapper.find('#current_page').text(currentIndex < 0 ? 1 : images.length > 0 ? currentIndex + 1 : 0);
        $wrapper.find('#max_page').text(images.length);
        if (images.length > 0) $wrapper.find('.delete-img').show();
        else $wrapper.find('.delete-img').hide();
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

    $wrapper.find('#defect_img').on('change', function (event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = 'Selected Image';
            img.classList.add('mx-auto');
            $currentImgDiv.append(img);
            currentIndex = $currentImgDiv.find('img').length - 1;
            updateCarousel();
            $wrapper.find('#defect_img').val('');
        }
    });

    $wrapper.find('.current-img').on('click', 'img', function () {
        convertIMG(this, '/Images/Defect');
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
    });

    updateCarousel();

    $(window).on('resize', function () {
        updateCarousel();
    });
}
