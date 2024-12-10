const UserName = $('#UserName').val();
const Department = $('#Department').val();
const IsCaller = $('#IsCaller').prop('checked');
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`/notificationHub?UserName=${UserName}&Department=${Department}&IsCaller=${IsCaller}`)
    .build();

connection.start().catch(err => console.error(err.toString()));

connection.on("ReceiveMessage", (fromUserId, message) => {
    $('#messagesList').append($(`<li>User ${fromUserId} whispered: ${message}</li>`))
});
$('#sendButton').on("click", () => {
    const fromUserId = $('#UserName').val();
    const toUserId = $('#toUser').val();
    const message = $('#messageInput').val();
    connection.invoke("SendMessage", fromUserId, toUserId, message).catch(err => console.error(err.toString()));
    $('#messagesList').append($(`<li>You whispered: ${message}</li>`))
})