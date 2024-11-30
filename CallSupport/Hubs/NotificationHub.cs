using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace CallSupport.Hubs
{
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            string UserName = Context.GetHttpContext().Request.Query["UserName"];
            await Groups.AddToGroupAsync(Context.ConnectionId, UserName);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            string UserName = Context.GetHttpContext().Request.Query["UserName"];
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, UserName);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string fromUserId, string toUserId, string message)
        { 
            await Clients.Group(toUserId).SendAsync("ReceiveMessage", fromUserId, message); 
        }
    }
}