/**
 * Fetch image from blob and send to server
 * @param {string} selector Selector for <img>
 * @param {string} url Server endpoint for sending the image
 */
function convertIMG(selector, url) {
    const img = $(selector)
    if (img.length > 1) throw new Error('Use one image only you retard')
    const imgSrc = img.attr('src');
    fetch(imgSrc)
        .then(response => response.blob())
        .then(blob => {
            const formData = new FormData();
            var fileType = blob.type.split('/')[1];
            formData.append('file', blob, `image.${fileType}`);
            $.ajax({
                url: url,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    console.log('Image uploaded successfully');
                },
                error: function (error) {
                    console.error('Error uploading image', error);
                }
            });
        })
        .catch(error => { console.error('Error fetching the Blob', error); });
}