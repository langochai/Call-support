var signalConn
$(() => {
    const UserName = $('#UserName').val();
    const Department = $('#Department').val();
    const IsCaller = !!$('#is_caller').prop('checked');
    signalConn = new signalR.HubConnectionBuilder()
        .withUrl(`/notificationHub?UserName=${UserName}&Department=${Department}&IsCaller=${IsCaller}`)
        .withAutomaticReconnect()
        .build();

    signalConn.start().catch(err => console.error(err.toString()));

    signalConn.on("RefreshHistory", (data) => {
        data = JSON.parse(data)
        const parser = new DOMParser();
        const insertXMLDoc = parser.parseFromString(data.Inserted, "text/xml");
        const deleteXMLDoc = parser.parseFromString(data.Deleted, "text/xml");
        const inserted = data.Inserted === null ? '' : xmlToObject(insertXMLDoc.documentElement);
        const deleted = data.Deleted === null ? '' : xmlToObject(deleteXMLDoc.documentElement);
        refreshHistory?.(data.NotificationType, inserted, deleted) // null properties will be omitted
    });
    signalConn.on("ReplyBro", (lineCode) => {
        updateLineCodeFromBro(lineCode)
    });
    signalConn.on("Error", (error) => {
        console.error(error)
        iziToast.error({ title: 'Thông báo', message: 'Kết nối đã bị ngắt', position: 'topRight', displayMode: 'once' })
    });
})
function xmlToObject(xml) {
    const obj = {};
    // Handle text nodes
    if (xml.nodeType === Node.TEXT_NODE) {
        return xml.nodeValue.trim();
    }
    // Handle attributes
    if (xml.attributes && xml.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let attr of xml.attributes) {
            obj["@attributes"][attr.nodeName] = attr.nodeValue;
        }
    }
    // Handle child nodes
    for (let child of xml.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            // If it's a text node with non-empty content, return the value
            const trimmedText = child.nodeValue.trim();
            if (trimmedText) return trimmedText;
        } else {
            // Process element nodes
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
