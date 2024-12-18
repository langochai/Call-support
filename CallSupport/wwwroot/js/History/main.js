$(async () => {
    await loadDepartments();
    await loadLinecodes();
    await loadDateInput();
    await loadHistoryData();
})
async function loadLinecodes() {
    const linesData = await getAllLines()
    $('#lines').empty()
    linesData.forEach(l => {
        const option = $(`<option value="${l.LineC}">${l.LineC}-${l.LineNm}</option>`)
        $('#lines').append(option)
    })
    $('#lines').on('change.bs.select', async function () {
        const username = $('#UserName').val()
        const settings = await readRecord(username);
        if (settings) {
            await updateRecord({ ...settings, lines: $('#lines').val() });
        } else {
            await createRecord({
                username: username,
                from_dep: $('#from_department').val(),
                to_dep: $('#to_department').val(),
                lines: $('#lines').val()
            });
        }
    }).bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Chọn dây chuyền',
        dropDownListHeight: 300,
        //debug: true,
        showSelectionAsList: true,
    })
    const { lines } = await readRecord($('#UserName').val());
    $('#lines').bsSelect('val', lines)
}
async function loadDepartments() {
    const departments = await getAllDepartments()
    $('#from_department,#to_department').empty()
    $('#from_department,#to_department').append($(`<option value='all'>Tất cả</option>`))
    departments.forEach(d => {
        const option = $(`<option value="${d.DepC}">${d.DepC} - ${d.DepNm}</option>`)
        $('#from_department,#to_department').append(option)
    })
    $('#from_department,#to_department').on('change.bs.select', async function () {
        const username = $('#UserName').val()
        const settings = await readRecord(username);
        if (settings) {
            await updateRecord({
                ...settings,
                from_dep: $('#from_department').val(),
                to_dep: $('#to_department').val(),
            });
        } else {
            await createRecord({
                username: username,
                from_dep: $('#from_department').val(),
                to_dep: $('#to_department').val(),
                lines: $('#lines').val()
            });
        }
    }).bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Chọn bộ phận',
        dropDownListHeight: 300,
        //debug: true,
    })
    const { from_dep, to_dep } = await readRecord($('#UserName').val());
    if (from_dep) $('#from_department').bsSelect('val', from_dep)
    if (to_dep) $('#to_department').bsSelect('val', to_dep)
}
function loadDateInput() {
    $('input[type="date"]').each(function () {
        this.valueAsDate = new Date();
    });
    $('input[type="date"]').on('change', function () {
        if (!this.value) this.valueAsDate = new Date();
    });
}
async function loadHistoryData() {
    const fromDate = $('#from_date').val()
    const toDate = $('#to_date').val()
    const fromDep = $('#from_department').val()
    const toDep = $('#to_department').val()
    const lines = $('#lines').val()
    const data = await getHistory(fromDate, toDate, fromDep, toDep, lines)
    const tbody = $('tbody')
    data.forEach(d => {
        const row = $(`<tr></tr>`)
        row.append($(`<td>${d.Line_c}</td>`))
        row.append($(`<td>${d.Line_nm}</td>`))
        row.append($(`<td>${d.Sec_nm}</td>`))
        row.append($(`<td>${d.Pos_nm}</td>`))
        row.append($(`<td>${d.Dep_c}</td>`))
        row.append($(`<td>${d.tenloi}</td>`))
        tbody.append(row)
    })
}