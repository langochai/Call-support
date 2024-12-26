using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace CallSupport.Hubs
{
    public class NotificationHub : Hub
    {
        private readonly ConnectionMapping _users;

        public NotificationHub(ConnectionMapping users)
        {
            _users = users; // Inject the singleton ConnectionMapping instance
        }

        public override async Task OnConnectedAsync()
        {
            var data = GetConnectionData(Context.GetHttpContext());
            _users.Add(Context.ConnectionId, data);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _users.Remove(Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        [HubMethodName("CallBro")]
        public async Task CallBro(string lineCode, string toDepartment)
        {
            var connections = _users.GetConnections(toDepartment, false);
            foreach (var connectionId in connections)
            {
                await Clients.Client(connectionId).SendAsync("ReplyBro", lineCode);
            }
        }

        [HubMethodName("DebugConnections")]
        public void DebugConnections()
        {
            foreach (var connection in _users.GetAllConnections())
            {
                Console.WriteLine($"ConnectionId={connection.ConnectionId}, UserName={connection.Data.UserName}, Department={connection.Data.Department}, IsCaller={connection.Data.IsCaller}");
            }
        }

        private static ConnectionData GetConnectionData(HttpContext context)
        {
            string userName = context.Request.Query["UserName"];
            string department = context.Request.Query["Department"];
            string isCaller = context.Request.Query["IsCaller"];
            return new ConnectionData
            {
                UserName = userName,
                Department = department,
                IsCaller = Convert.ToBoolean(isCaller)
            };
        }
    }
}
