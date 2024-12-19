$(async () => {
    await loadDepartments();
    await loadLinecodes();
    await loadDateInput();
    await loadHistoryData();
    $('.refresh-history').on('click', loadHistoryData)
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
    $('#from_date').each(function () {
        let date = new Date();
        date.setDate(date.getDate() - 1);
        this.valueAsDate = date;
    });
    $('#to_date').each(function () {
        this.valueAsDate = new Date();
    });
    $('input[type="date"]').on('change', function () {
        if (!this.value) this.valueAsDate = new Date();
        loadHistoryData()
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
    tbody.empty()
    data.forEach(d => {
        const row = $(`<tr class="${getRowClassName(d.Status_calling)}"></tr>`)
        row.append($(`<td class="text-wrap text-break">${d.Line_c}</td>`))
        row.append($(`<td class="text-wrap text-break">${d.Line_nm}</td>`))
        row.append($(`<td class="text-wrap text-break">${d.Sec_nm}</td>`))
        row.append($(`<td class="text-wrap text-break">${d.Pos_nm}</td>`))
        row.append($(`<td class="text-wrap text-break">${d.Dep_c}</td>`))
        row.append($(`<td class="text-wrap text-break">${d.tenloi}</td>`))
        row.append($(`<td class="text-wrap text-break">${toVNDateTime(d.Calling_time)}</td>`))
        row.data('data', d)
        tbody.append(row)
    })
}
/**
 * Use this function to check the data change from notification.js
 * @param {string} actionType It can be 'Insert', 'Update', 'Delete' or 'None'
 * @param {object} inserted Inserted data. Returns empty string if not exist
 * @param {object} deleted Deleted data. Returns empty string if not exist
 */
async function refreshHistory(actionType, inserted, deleted) {
    console.log(actionType, inserted, deleted);
    const tbody = $('tbody')
    if (actionType === 'Insert') {
        if (!isWithinDateRange(inserted.Calling_time)) return;
        const data = await getHistoryDetails(inserted.Calling_time, inserted.Line_c, inserted.Sec_c, inserted.Pos_c)
        if (!data.length) return;
        const row = $(`<tr class="${getRowClassName(data[0].Status_calling)}"></tr>`)
        row.append($(`<td class="text-wrap text-break">${data[0].Line_c}</td>`))
        row.append($(`<td class="text-wrap text-break">${data[0].Line_nm}</td>`))
        row.append($(`<td class="text-wrap text-break">${data[0].Sec_nm}</td>`))
        row.append($(`<td class="text-wrap text-break">${data[0].Pos_nm}</td>`))
        row.append($(`<td class="text-wrap text-break">${data[0].Dep_c}</td>`))
        row.append($(`<td class="text-wrap text-break">${data[0].tenloi}</td>`))
        row.append($(`<td class="text-wrap text-break">${toVNDateTime(data[0].Calling_time)}</td>`))
        row.data('data', data[0])
        tbody.prepend(row)
    }
    if (actionType === 'Update') {
        if (!isWithinDateRange(inserted.Calling_time)) return;
        const data = await getHistoryDetails(inserted.Calling_time, inserted.Line_c, inserted.Sec_c, inserted.Pos_c)
        if (!data.length) return;
        const updateRow = tbody.find('tr').filter((i, r) => {
            const rowData = $(r).data('data')
            return new Date(rowData.Calling_time).getTime() == new Date(inserted.Calling_time).getTime() && 
                rowData.Line_c == inserted.Line_c && 
                rowData.Sec_c == inserted.Sec_c && 
                rowData.Pos_c == inserted.Pos_c 
        }).eq(0)
        updateRow.attr('class', getRowClassName(data[0].Status_calling))
        updateRow.children('td:nth-child(1)').text(`${data[0].Line_c}`);
        updateRow.children('td:nth-child(2)').text(`${data[0].Line_nm}`);
        updateRow.children('td:nth-child(3)').text(`${data[0].Sec_nm}`);
        updateRow.children('td:nth-child(4)').text(`${data[0].Pos_nm}`);
        updateRow.children('td:nth-child(5)').text(`${data[0].Dep_c}`);
        updateRow.children('td:nth-child(6)').text(`${data[0].tenloi}`);
        updateRow.children('td:nth-child(7)').text(`${toVNDateTime(data[0].Calling_time)}`);
        updateRow.data('data', data[0])
    }
    if (actionType === 'Delete') {
        if (!isWithinDateRange(deleted.Calling_time)) return;
        tbody.find('tr').filter((i, r) => {
            const rowData = $(r).data('data')
            return new Date(rowData.Calling_time).getTime() == new Date(deleted.Calling_time).getTime() &&
                rowData.Line_c == deleted.Line_c &&
                rowData.Sec_c == deleted.Sec_c &&
                rowData.Pos_c == deleted.Pos_c
        }).eq(0).remove()
    }
}
function getRowClassName(statusCalling) {
    if (statusCalling == 0) return "waiting"
    if (statusCalling == 1) return "repairing"
    if (statusCalling == 2) return "finished"
}
function isWithinDateRange(dateString) {
    const date = new Date(dateString);
    const fromDate = new Date($('#from_date').val());
    const toDate = new Date($('#to_date').val());
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    return date >= fromDate && date <= toDate;
}