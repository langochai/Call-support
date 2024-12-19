/**
 * Get lists of positions
 * @param {string} search String to search upon
 * @param {number} offset Number of offset
 * @returns {object[]}
 */
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
/**
 * Get lists of Lines
 * @param {string} search String to search upon
 * @param {number} offset Number of offset
 * @returns {object[]}
 */
function getLines(search = '', offset = 0) {
    return new Promise(resolve => {
        $.get({
            url: `/Lines?offset=${+offset}&` + (search ? `search=${search}` : ''),
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu dây chuyền thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
function getAllLines() {
    return new Promise(resolve => {
        $.get({
            url: `/Lines/All`,
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu dây chuyền thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
/**
 * Get lists of sections
 * @param {string} search String to search upon
 * @param {number} offset Number of offset
 * @returns {object[]}
 */
function getSections(search = '', offset = 0) {
    return new Promise(resolve => {
        $.get({
            url: `/Sections?offset=${+offset}&` + (search ? `search=${search}` : ''),
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu công đoạn thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
/**
 * Get lists of departments
 * @param {string} search String to search upon
 * @param {number} offset Number of offset
 * @returns {object[]}
 */
function getDepartments(search = '', offset = 0) {
    return new Promise(resolve => {
        $.get({
            url: `/Departments?offset=${+offset}&` + (search ? `search=${search}` : ''),
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu bộ phận thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
function getAllDepartments() {
    return new Promise(resolve => {
        $.get({
            url: `/Departments/All`,
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu bộ phận thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
/**
 * Get lists of basic defects
 * @param {string} search String to search upon
 * @param {number} offset Number of offset
 * @returns {object[]}
 */
function getDefects(search = '', offset = 0) {
    return new Promise(resolve => {
        $.get({
            url: `/Defects?offset=${+offset}&` + (search ? `search=${search}` : ''),
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu lỗi thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
/**
 * Get lists of tools
 * @param {string} search String to search upon
 * @returns {object[]}
 */
function getTools(search = '') {
    return new Promise(resolve => {
        $.get({
            url: `/Tools` + (search ? `?search=${search}`:''),
            success: data => resolve(data),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu dụng cụ thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
/**
 * Create a call using caller permission
 * @param {object} data Plain old data from previos app
 * @param {object} extra Extra information from this new app
 * @returns {object} The inserted call
 */
function createCall(data, extra = {}) {
    return new Promise(resolve => {
        $.post({
            url: `/Call`,
            data: {data, extra},
            success: result => resolve(result),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: err.status == 409 ? err.responseText :'Tạo cuộc gọi thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
function getHistory(fromDate, toDate, fromDep, toDep, lines, offset = '', limit = '') {
    if (fromDep == 'all') fromDep = ''
    if (toDep == 'all') toDep = ''
    return new Promise(resolve => {
        $.get({
            url: `/History/Data?fromDate=${fromDate}&toDate=${toDate}&fromDep=${fromDep}&toDep=${toDep}&lines=${lines?.join(',')}`,
            success: result => resolve(result),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu lịch sử thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}
function getHistoryDetails(callingTime, line, section, position) {
    return new Promise(resolve => {
        $.get({
            url: `/History/Details?callingTime=${callingTime}&line=${line}&section=${section}&position=${position}`,
            success: result => resolve(result),
            error: err => {
                console.error(err)
                iziToast.error({
                    title: 'Lỗi',
                    message: 'Load dữ liệu lịch sử thất bại',
                    displayMode: 1,
                    position: 'topRight'
                });
                resolve()
            }
        })
    })
}