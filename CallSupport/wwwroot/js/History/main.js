﻿$(async () => {
    try {
        await InitializeDB();
        await loadDepartments();
        await loadLinecodes();
        await loadDateInput();
        await loadRepairStatus();
        await loadHistoryData();
        await InitializeSignal({ refreshHistory, updateLineCodeFromBro });
        await requestNotificationPermission();
        $('.refresh-history').on('click', loadHistoryData)
        displayPrettier()
        statusButtons()
    }
    catch (err) {
        iziToast.error({ title: "Lỗi", message: err.message, position: 'topRight', displayMode: 'once' })
        console.error(err)
    }
})
var db;
/**
 * Initialize browser database
 * @returns {Promise<void>}
 */
function InitializeDB() {
    return new Promise((resolve, reject) => {
        var request = indexedDB.open('Settings', 1);

        request.onupgradeneeded = function (event) {
            db = event.target.result;
            var objectStore = db.createObjectStore('History', { keyPath: 'username' });
            objectStore.createIndex('username', 'username', { unique: true });
            objectStore.createIndex('from_dep', 'from_dep', { unique: false });
            objectStore.createIndex('to_dep', 'to_dep', { unique: false });
            objectStore.createIndex('lines', 'lines', { unique: false });
            objectStore.createIndex('status', 'status', { unique: false });
            objectStore.transaction.oncomplete = function () {
                resolve();
            };
            objectStore.transaction.onerror = function (e) {
                reject(e.target.error);
            };
        };

        request.onsuccess = function (event) {
            db = event.target.result;
            resolve()
            //console.log('Database opened successfully');
        };

        request.onerror = function (event) {
            console.log('Error opening database:', event.target.error);
            reject()
        };
    })
}

/**
 * Save new settings to DB
 * @param {object} record
 */
async function createRecord(record) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History'], 'readwrite');
        var objectStore = transaction.objectStore('History');
        var request = objectStore.add(record);

        request.onsuccess = function (event) {
            resolve(record);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

/**
 * Get settings of an user
 * @param {string} username
 */
async function readRecord(username) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History']);
        var objectStore = transaction.objectStore('History');
        var request = objectStore.get(username);

        request.onsuccess = function (event) {
            if (request.result) {
                resolve(request.result);
            } else {
                resolve({});
            }
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

/**
 * Update existing settings
 * @param {object} record
 */
async function updateRecord(record) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History'], 'readwrite');
        var objectStore = transaction.objectStore('History');
        var request = objectStore.put(record);

        request.onsuccess = function (event) {
            resolve(record);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

/**
 * Delete settings of an user
 * @param {string} username
 */
async function deleteRecord(username) {
    return new Promise((resolve, reject) => {
        var transaction = db.transaction(['History'], 'readwrite');
        var objectStore = transaction.objectStore('History');
        var request = objectStore.delete(username);

        request.onsuccess = function (event) {
            resolve(username);
        };

        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}
var signalConn;
/**
 * Initialize signal to backend
 * @param {object} callbacks List of callbacks. Save each of them to a property
 * @returns {Promise<void>}
 */
function InitializeSignal(callbacks) {
    return new Promise((resolve, reject) => {
        const UserName = $('#UserName').val();
        const Department = $('#Department').val();
        const IsCaller = !!$('#is_caller').prop('checked');
        signalConn = new signalR.HubConnectionBuilder()
            .withUrl(`/notificationHub?UserName=${UserName}&Department=${Department}&IsCaller=${IsCaller}`)
            .withAutomaticReconnect()
            .build();

        signalConn.on("RefreshHistory", (data) => {
            data = JSON.parse(data)
            const parser = new DOMParser();
            const insertXMLDoc = parser.parseFromString(data.Inserted, "text/xml");
            const deleteXMLDoc = parser.parseFromString(data.Deleted, "text/xml");
            const inserted = data.Inserted === null ? '' : xmlToObject(insertXMLDoc.documentElement);
            const deleted = data.Deleted === null ? '' : xmlToObject(deleteXMLDoc.documentElement);
            callbacks.refreshHistory?.(data.NotificationType, inserted, deleted) // null properties will be omitted
        });
        signalConn.on("ReplyBro", (lineCode) => {
            callbacks.updateLineCodeFromBro?.(lineCode)
        });
        signalConn.on("Error", (error) => {
            console.error(error)
            iziToast.error({ title: 'Thông báo', message: 'Kết nối đã bị ngắt', position: 'topRight', displayMode: 'once' })
        });
        signalConn.start().then(() => resolve()).catch(err => reject(err));
    })
}
function xmlToObject(xml) {
    const obj = {};
    if (xml.nodeType === Node.TEXT_NODE) {
        return xml.nodeValue.trim();
    }
    if (xml.attributes && xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let attr of xml.attributes) {
            obj["@attributes"][attr.nodeName] = attr.nodeValue;
        }
    }
    for (let child of xml.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            const trimmedText = child.nodeValue.trim();
            if (trimmedText) return trimmedText;
        } else {
            const nodeName = child.nodeName;
            const nodeValue = xmlToObject(child);

            if (obj[nodeName] === undefined) {
                obj[nodeName] = nodeValue;
            } else {
                // If the node already exists, turn it into an array
                if (!Array.isArray(obj[nodeName])) {
                    obj[nodeName] = [obj[nodeName]];
                }
                obj[nodeName].push(nodeValue);
            }
        }
    }
    return (obj);
}

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
        if (!$.isEmptyObject(settings)) {
            await updateRecord({ ...settings, lines: $('#lines').val() });
        } else {
            await createRecord({
                username: username,
                from_dep: $('#from_department').val(),
                to_dep: $('#to_department').val(),
                lines: $('#lines').val(),
                status: $('#repair_status').val(),
            });
        }
    }).bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Tất cả',
        dropDownListHeight: 300,
        //debug: true,
        showSelectionAsList: true,
    })
    const { lines } = await readRecord($('#UserName').val());
    $('#lines').bsSelect('val', lines)
}
async function loadDepartments() {
    const isCaller = $('#is_caller').prop('checked')
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
        if (!$.isEmptyObject(settings)) {
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
                lines: $('#lines').val(),
                status: $('#repair_status').val(),
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
    else $('#from_department').bsSelect('val', isCaller ? $('#Department').val() : 'all')
    if (to_dep) $('#to_department').bsSelect('val', to_dep)
    else $('#to_department').bsSelect('val', !isCaller ? $('#Department').val() : 'all')
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
async function loadRepairStatus() {
    $('#repair_status').on('change.bs.select', async function () {
        const username = $('#UserName').val()
        const settings = await readRecord(username);
        if (!$.isEmptyObject(settings)) {
            await updateRecord({ ...settings, status: $('#repair_status').val() });
        } else {
            await createRecord({
                username: username,
                from_dep: $('#from_department').val(),
                to_dep: $('#to_department').val(),
                lines: $('#lines').val(),
                status: $('#repair_status').val(),
            });
        }
    }).bsSelect({
        btnWidth: '',
        btnClass: 'btn-outline-secondary w-100 text-decoration-none',
        btnEmptyText: 'Tất cả',
        dropDownListHeight: 300,
        showSelectionAsList: true,
    })
    const { status } = await readRecord($('#UserName').val());
    $('#repair_status').bsSelect('val', status)
    status?.forEach(st => $('.status-showcase').eq(+st).addClass('active'))
}
async function loadHistoryData() {
    try {
        const fromDate = $('#from_date').val()
        const toDate = $('#to_date').val()
        const fromDep = $('#from_department').val()
        const toDep = $('#to_department').val()
        const lines = $('#lines').val().join(',')
        const status = $('#repair_status').val().join(',')
        iziToast.success({ title: "Loading", message: "Đang tải dữ liệu...", position: 'topRight', timeout: 30000 })
        const data = await getHistory(fromDate, toDate, fromDep, toDep, lines, status)
        const tbody = $('tbody')
        tbody.empty()
        data.forEach(d => {
            const row = $(`<tr class="${getRowClassName(d.Status_calling, d.Confirm_time)} display-row"></tr>`)
            row.append($(`<td class="text-wrap text-break">${d.Line_c}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.Line_nm}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.Sec_nm}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.Pos_nm}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.ToDep_c}</td>`))
            row.append($(`<td class="text-wrap text-break">${d.tenloi}</td>`))
            row.append($(`<td class="text-wrap text-break">${toVNDateTime(d.Calling_time)}</td>`))
            row.data('data', d)
            row.on('click', showCallDetails)
            tbody.append(row)
        })
    }
    catch (err) {
        console.error(err)
        iziToast.error({ title: "Lỗi", message: "Load dữ liệu thất bại", position: 'topRight', displayMode: 'once', timeout: 30000 })
    }
    finally {
        var toast = document.querySelector('.iziToast');
        iziToast.hide({}, toast);
        rearrangeRows()
    }
}
/**
 * Use this function to check the data change from notification.js
 * @param {string} actionType It can be 'Insert', 'Update', 'Delete' or 'None'
 * @param {object} inserted Inserted data. Returns empty string if not exist
 * @param {object} deleted Deleted data. Returns empty string if not exist
 */
async function refreshHistory(actionType, inserted, deleted) {
    if (actionType === 'Insert') await addRow(inserted, deleted)
    if (actionType === 'Update') await updateRow(inserted, deleted)
    if (actionType === 'Delete') await deleteRow(inserted, deleted)
    rearrangeRows()
}
async function addRow(inserted, deleted) {
    const tbody = $('tbody')
    if (!isWithinDateRange(inserted.Calling_time)) return;
    const data = await getHistoryDetails(inserted.Calling_time, inserted.Line_c, inserted.Sec_c, inserted.Pos_c);
    if (!data.length) return;
    const fromDep = $('#from_department').val()
    const toDep = $('#to_department').val()
    const lines = $('#lines').val()
    const status = $('#repair_status').val()
    console.log('Inserted', data);
    const isNotNeccessary = 
        (data[0].Dep_c != fromDep && fromDep?.toLowerCase() != 'all') ||
        (data[0].ToDep_c != toDep && toDep?.toLowerCase() != 'all') ||
        (!!lines.length && !lines.includes(data[0].Line_c)) ||
        (!!status.length && !status.includes(data[0].Status_calling))
    if (isNotNeccessary) return;
    const row = $(`<tr class="${getRowClassName(data[0].Status_calling, data[0].Confirm_time)} display-row"></tr>`)
    row.append($(`<td class="text-wrap text-break">${data[0].Line_c}</td>`))
    row.append($(`<td class="text-wrap text-break">${data[0].Line_nm}</td>`))
    row.append($(`<td class="text-wrap text-break">${data[0].Sec_nm}</td>`))
    row.append($(`<td class="text-wrap text-break">${data[0].Pos_nm}</td>`))
    row.append($(`<td class="text-wrap text-break">${data[0].ToDep_c}</td>`))
    row.append($(`<td class="text-wrap text-break">${data[0].tenloi}</td>`))
    row.append($(`<td class="text-wrap text-break">${toVNDateTime(data[0].Calling_time)}</td>`))
    row.data('data', data[0])
    row.on('click', showCallDetails)
    tbody.prepend(row)
    if (data[0].ToDep_c == $('#Department').val())
        iziToast.success({ title: "Thông báo", message: "Có cuộc gọi mới tới bộ phận của bạn", position: 'topRight', displayMode: 'once', timeout: 30000 })
    showNotification('Thông báo', {
        body: 'Có cuộc gọi mới tới bộ phận của bạn',
        icon: `${window.location.origin}/favicon.ico`
    });
}
async function updateRow(inserted, deleted) {
    const tbody = $('tbody')
    if (!isWithinDateRange(inserted.Calling_time)) return;
    if (inserted.Status_calling == 2 && inserted.Finish_time) return deleteRow(null, inserted); 
    const data = await getHistoryDetails(inserted.Calling_time, inserted.Line_c, inserted.Sec_c, inserted.Pos_c);
    if (!data.length) return;
    console.log('Updated', data);
    const updateRow = tbody.find('tr.display-row').filter((i, r) => {
        const rowData = $(r).data('data')
        return new Date(rowData.Calling_time).getTime() == new Date(inserted.Calling_time).getTime() &&
            rowData.Line_c == inserted.Line_c &&
            rowData.Sec_c == inserted.Sec_c &&
            rowData.Pos_c == inserted.Pos_c
    }).eq(0)
    updateRow.removeClass('waiting repairing finished').addClass(getRowClassName(data[0].Status_calling, data[0].Confirm_time))
    updateRow.children('td:nth-child(1)').text(`${data[0].Line_c}`);
    updateRow.children('td:nth-child(2)').text(`${data[0].Line_nm}`);
    updateRow.children('td:nth-child(3)').text(`${data[0].Sec_nm}`);
    updateRow.children('td:nth-child(4)').text(`${data[0].Pos_nm}`);
    updateRow.children('td:nth-child(5)').text(`${data[0].ToDep_c}`);
    updateRow.children('td:nth-child(6)').text(`${data[0].tenloi}`);
    updateRow.children('td:nth-child(7)').text(`${toVNDateTime(data[0].Calling_time)}`);
    updateRow.data('data', data[0])
    if (updateRow.hasClass('expand')) { // Update details if it's opened
        const repairName = updateRow.next().find('.rep-name')
        const waitDuration = updateRow.next().find('.wait-duration')
        const startRepairTime = updateRow.next().find('.start-repair-time')
        const repairDuration = updateRow.next().find('.repair-duration')
        const confirmTime = updateRow.next().find('.confirm-time')
        repairName.text(`: ${data[0].RepairerName}`);
        waitDuration.attr('data-value', data[0].Calling_time)
        repairDuration.attr('data-value', data[0].Repairing_time)
        if (!deleted.Repairing_time && data[0].Repairing_time) {
            clearInterval(waitDuration.data('data-interval'))
            startRepairTime.text(data[0].Repairing_time)
            repairDuration.data('data-interval', setInterval(() => updateTimeSpan(repairDuration), 1000))
        }
        if (!deleted.Confirm_time && data[0].Confirm_time) {
            clearInterval(repairDuration.data('data-interval'))
            confirmTime.text(data[0].Confirm_time)
        }
    }
}
async function deleteRow(inserted, deleted) {
    const tbody = $('tbody')
    if (!isWithinDateRange(deleted.Calling_time)) return;
    console.log('Deleted', deleted);
    const row = tbody.find('tr.display-row').filter((i, r) => {
        const rowData = $(r).data('data');
        return new Date(rowData.Calling_time).getTime() == new Date(deleted.Calling_time).getTime() &&
            rowData.Line_c == deleted.Line_c &&
            rowData.Sec_c == deleted.Sec_c &&
            rowData.Pos_c == deleted.Pos_c
    }).eq(0)
    if (row.hasClass('expand')) row.trigger('click');
    row.remove()
}
function rearrangeRows() {
    const tbody = $('tbody');
    const waiting = tbody.find('tr.waiting');
    const repairing = tbody.find('tr.repairing');
    const finished = tbody.find('tr.finished');
    tbody.append([...waiting, ...repairing, ...finished]);
}
async function showCallDetails() {
    const $row = $(this)
    const isCaller = $('#is_caller').prop('checked')
    let updateWaitTimeInterval;
    let updateRepairTimeInterval;
    $row.toggleClass('expand')
    if ($row.hasClass('expand')) {
        const rowData = $row.data('data')
        const [details] = await getHistoryDetails(rowData.Calling_time, rowData.Line_c, rowData.Sec_c, rowData.Pos_c)
        if (!details) return iziToast.error({ title: "Lỗi", message: "Đã có lỗi xảy ra", position: 'topRight', displayMode: 'replace' });
        console.log(details);
        const callTime = details.Calling_time != null ? toVNDateTime(details.Calling_time) : ''
        const repairTime = details.Repairing_time != null ? toVNDateTime(details.Repairing_time) : ''
        const confirmTime = details.Confirm_time != null ? toVNDateTime(details.Confirm_time) : ''
        const $detailRow = $(`<tr></tr>`)
        const $container = $(`<td class="p-3" colspan="7" style="display:none;background-color: #dee2e6"></td>`)
        const $table = $(
            `<table class="table table-bordered table-call-details">
                <tr>
                    <td><span class="info-header">Mã chuyền</span>: ${details.Line_c}</td>
                    <td><span class="info-header">Tên chuyền</span>: ${details.Line_nm}</td>
                </tr>
                <tr>
                    <td><span class="info-header">Công đoạn</span>: ${details.Sec_nm}</td>
                    <td><span class="info-header">Vị trí</span>: ${details.Pos_nm}</td>
                </tr>
                <tr>
                    <td><span class="info-header">Bộ phận gọi</span>: ${details.Dep_c}</td>
                    <td><span class="info-header">Bộ phận sửa</span>: ${details.ToDep_c}</td>
                </tr>
                <tr>
                    <td colspan="2"><span class="info-header">Loại lỗi</span>: ${details.tenloi}</td>
                </tr>
                <tr>
                    <td colspan="2">
                        <span class="info-header">Trạng thái chuyền</span>: ${details.Status_line ? 'Dừng chuyền' : 'Đang chạy'}
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><span class="info-header">Người sửa</span><span class='rep-name'>: ${details.RepairerName ?? ''}</span></td>
                </tr>
                <tr>
                    <td><span class="info-header">TG Gọi</span>: ${callTime}</td>
                    <td>
                        <span class="info-header">TG chờ sửa chữa</span>:
                        <span class="wait-duration" data-value="${details.Calling_time ?? ''}">
                            ${getTimeSpan(details.Calling_time, details.Repairing_time)}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td><span class="info-header">TG Sửa</span>: <span class="start-repair-time">${repairTime}</span></td>
                    <td>
                        <span class="info-header">TG đang sửa chữa</span>:
                        <span class="repair-duration" data-value="${details.Repairing_time ?? ''}">
                            ${getTimeSpan(details.Repairing_time, details.Confirm_time)}
                        </span>
                    </td>
                </tr>
                <tr>
                    <td colspan="2"><span class="info-header">TG Hoàn thành</span>: <span class="confirm-time">${confirmTime}</span></td>
                </tr>
            </table>`
        )
        if (!details.Repairing_time) {
            $table.find('.wait-duration').data('data-interval', setInterval(() => updateTimeSpan($table.find('.wait-duration')), 1000))
        }
        if (!details.Confirm_time) {
            $table.find('.repair-duration').data('data-interval', setInterval(() => updateTimeSpan($table.find('.repair-duration')), 1000))
        }
        const $moveToRepair = createRepairButton(details)
        const $askBrosForHelp = createForwardRepairersButton(details)
        const $generateQR = createQRButton(details)
        $container.append($table)
        if (!isCaller && $('#Department').val() == details.ToDep_c && !details.Finish_time) $container.append($moveToRepair).append($askBrosForHelp);
        if (isCaller && $('#Department').val() == details.Dep_c && !details.Finish_time) $container.append($generateQR)
        $detailRow.append($container)
        $row.after($detailRow)
        $container.slideDown('fast')
    } else {
        clearInterval(updateWaitTimeInterval)
        clearInterval(updateRepairTimeInterval)
        $row.next().find('td').slideUp('fast', function () {
            $(this).closest('tr').remove()
        })
    }
}
function getRowClassName(statusCalling, confirmTime) {
    if (statusCalling == 0) return "waiting"
    if (statusCalling == 1 && !confirmTime) return "repairing"
    if ((statusCalling == 1 && confirmTime) || statusCalling == 2) return "finished"
}
function createRepairButton(details) {
    return $(
        `<a href="/Repair/Details?time=${new Date(details.Calling_time).getTime()}&line=${details.Line_c}&section=${details.Sec_c}&position=${details.Pos_c}"
                    class="btn btn-success me-1 btn-repair">
                Sửa chữa
            </a>`
    )
}
function createForwardRepairersButton(details) {
    const button = $(`<button class="btn btn-info">Chuyển tiếp</button>`)
    button.on('click', () => {
        signalConn?.invoke("CallBro", details.Line_c, details.ToDep_c)
            .catch(err => console.error(err))
        iziToast.success({ title: "Thông báo", message: "Chuyển tiếp thành công", position: 'topRight', displayMode: 'once' })
    })
    return button
}
function createQRButton(details) {
    const button = $(`<button class="btn btn-primary">Tạo QR</button>`)
    button.on('click', async function () {
        const data = await getQRCode(details.Calling_time, details.Line_c, details.Sec_c, details.Pos_c)
        $('#qr_code').empty()
        new QRCode(document.getElementById("qr_code"), {
            text: JSON.stringify(data),
            width: 330,
            height: 330,
        });
        $('#qr_modal').modal('show')
    })
    return button
}
function isWithinDateRange(dateString) {
    const date = new Date(dateString);
    const fromDate = new Date($('#from_date').val());
    const toDate = new Date($('#to_date').val());
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    return date >= fromDate && date <= toDate; //remember to use .getTime() if you're not using >= or <=
}
function getTimeSpan(dateString, timePoint = '') {
    if (!dateString) return '';
    timePoint = !timePoint ? new Date() : new Date(timePoint);
    if (dateString == null) return '';
    let givenDate = new Date(dateString);
    let difference = timePoint - givenDate;
    let hours = Math.floor(difference / (1000 * 60 * 60));
    let minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
function updateTimeSpan(element) {
    const timeValue = element.attr('data-value')
    const newText = getTimeSpan(timeValue)
    element.text(newText)
}
function displayPrettier() { // for visual only
    $('button.accordion-button').on('click', function () {
        $(this).find('i').toggleClass('fa-spin')
    })
    $('.refresh-history')
        .on('mouseover', function () {
            $(this).find('i').addClass('fa-spin')
        })
        .on('mouseleave', function () {
            $(this).find('i').removeClass('fa-spin')
        })
}
function updateLineCodeFromBro(lineCode) {
    console.log(lineCode);
    const lines = $('#lines').val()
    if (!lines.length || lines.includes(lineCode)) return;
    $('#lines').bsSelect('val', [...lines, lineCode])
    $('#lines').trigger('change.bs.select')
    $('.refresh-history').trigger('click')
    iziToast.success({
        title: 'Thông báo',
        message: 'Một dây chuyền đã được chuyển tiếp tới bạn',
        position: 'topRight',
        timeout: 120000,
    })
}
function statusButtons() {
    $('.status-showcase').on('click', function () {
        if ($(this).hasClass('active')) {
            $('#repair_status').bsSelect('val', '')
            $('.status-showcase').removeClass('active')
        }
        else {
            const value = $(this).hasClass('red') ? 0 : $(this).hasClass('white') ? 1 : 2
            $('#repair_status').bsSelect('val', value)
            $('.status-showcase').removeClass('active')
            $(this).addClass('active')
        }
        $('.refresh-history').trigger('click')
    })
}
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted!');
            } else {
                console.log('Notification permission denied!');
            }
        });
    }
}
function showNotification(title, options) {
    //if ('Notification' in window) {
    //    if (Notification.permission === 'granted') {
    //        const notification = new Notification(title, options);
    //        notification.onclick = function (event) {
    //            event.preventDefault();
    //            window.focus();
    //        };
    //    }
    //}
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            console.log("Service Worker Ready:", registration);
            registration.showNotification(title, options)
                .then(() => console.log("Notification sent!"))
                .catch(error => console.error("Notification failed:", error));
        }).catch(error => console.log('Service Worker not ready:', error));
    } else {
        console.log('Service Worker or Push API not supported.');
    }
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service.js').then(function (registration) {
        console.log('Service Worker registered with scope:', registration.scope);
    }).catch(function (error) {
        console.log('Service Worker registration failed:', error);
    });
}