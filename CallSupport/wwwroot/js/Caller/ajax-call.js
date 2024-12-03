function getPositions(search = '', offset = 0) {
    return new Promise(resolve => {
        $.get({
            url: `/Positions?offset=${+offset}&` + (search ? `search=${search}` : ''),
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu vị trí thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}