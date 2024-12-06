using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace CallSupport.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly ConnectionMapping _users = new ConnectionMapping();

        public override async Task OnConnectedAsync()
        {
            var user = GetUser(Context.GetHttpContext());
            _users.Add(user, Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var user = GetUser(Context.GetHttpContext());
            _users.Remove(user, Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("CallSupport")]
        public async Task SendMessageToDepartment(UserInfo fromUser, string toDepartment)
        {
            var connections = _users.GetConnections(new UserInfo { Department = toDepartment, IsCaller = false });
            foreach (var connectionId in connections)
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessage", fromUser);
            }
        }

        [HubMethodName("Repair")]
        public async Task ReplyToSpecificUser(UserInfo fromUser, string toUserName)
        {
            var connections = _users.GetConnections(new UserInfo { UserName = toUserName, IsCaller = true });
            foreach (var connectionId in connections)
            {
                await Clients.Client(connectionId).SendAsync("ReceiveMessage", fromUser);
            }
        }

        #region Utilities

        private static UserInfo GetUser(HttpContext context)
        {
            string UserName = context.Request.Query["UserName"];
            string Department = context.Request.Query["Department"];
            string IsCaller = context.Request.Query["IsCaller"];
            var User = new UserInfo
            {
                UserName = UserName,
                Department = Department,
                IsCaller = Convert.ToBoolean(IsCaller)
            };
            return User;
        }

        #endregion Utilities
    }
}