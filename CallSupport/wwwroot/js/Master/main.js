$(() => {
    loadData('#positions', getPositions, ['PosC', 'PosNm', 'action'])
    loadData('#lines', getLines, ['LineC', 'LineNm', 'action'])
    loadData('#sections', getSections, ['SecC', 'SecNm', 'action'])
    loadData('#departments', getDepartments, ['DepC', 'DepNm', 'action'])
    loadData('#defects', getDefects, ['Maloi', 'Tenloi', 'action'])
    displaySidebar()
})
async function loadData(selector, getData, columns) {
    const input = $(selector)
    const table = input.parent().next()
    const options = {
        fetchData: async function (rowCount) {
            const search = input.val()
            const data = await getData(search, rowCount)
            return data.map(d => ({
                ...d,
                action: `<span class="btn btn-danger" title="Xóa"><i class="fas fa-trash"></i></span>`
            }))
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
function displaySidebar() {
    const $ul = $('#navigation-list')
    $ul.empty()
    $ul.append($(`<li class="my-3 py-2"><label for="toggle-side-bar"><a href="#Positions">Vị trí</a></label></li?`))
    $ul.append($(`<li class="my-3 py-2"><a href="#Lines">Dây chuyền</a></li?`))
    $ul.append($(`<li class="my-3 py-2"><a href="#Sections">Công đoạn</a></li?`))
    $ul.append($(`<li class="my-3 py-2"><a href="#Departments">Bộ phận</a></li?`))
    $ul.append($(`<li class="my-3 py-2"><a href="#Defects">Lỗi</a></li?`))
    $ul.append($(`<li class="my-3 py-2"><a href="#Tools">Dụng cụ</a></li?`))
    $ul.off('click').on('click', 'li', () => {$('#backdrop').trigger('click') })
}
function openModalCreate(selector, modal, ) {
    
}
function openModalEdit() {
    
}