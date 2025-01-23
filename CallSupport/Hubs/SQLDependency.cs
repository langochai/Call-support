using CallSupport.Common;
using CallSupport.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System;
using CallSupport.Models.DTO;
using static CallSupport.Common.SqlDependencyEx;
using System.Xml.Linq;
namespace CallSupport.Hubs
{
    public class SqlDependencyService
    {
        private readonly string _connectionString;
        private readonly IHubContext<NotificationHub> _hubContext;
        private SqlDependencyEx _dependency;
        public bool isStopped = false;

        public SqlDependencyService(IConfiguration configuration, IHubContext<NotificationHub> hubContext)
        {
            _connectionString = Startup.ConnectionString;
            _hubContext = hubContext;
            _dependency = new SqlDependencyEx(_connectionString, "CallASSYDB", "history_mst");
            _dependency.TableChanged += TableChangedHandler;
            //_dependency.Stop();
            _dependency.Start();
        }

        private void TableChangedHandler(object sender, SqlDependencyEx.TableChangedEventArgs e) 
        {
            try
            {
                var (inserted, deleted) = ToInsertedDeleted(e.Data);
                var options = new JsonSerializerOptions { WriteIndented = true };
                var result = new
                {
                    NotificationType = e.NotificationType.ToString(),
                    Inserted = inserted?.ToString().Replace("<inserted>","").Replace("</inserted>", ""),
                    Deleted = deleted?.ToString().Replace("<deleted>", "").Replace("</deleted>", ""),
                };
                string resultJson = JsonSerializer.Serialize(result, options);
                _hubContext.Clients.All.SendAsync("RefreshHistory", resultJson).Wait();
            }
            catch (Exception ex) 
            {
                _hubContext.Clients.All.SendAsync("Error", ex.Message).Wait();
            }
        }
        public void Stop() { _dependency.Stop(); }
        public static (XElement Inserted, XElement Deleted) ToInsertedDeleted(XElement rootElement)
        {
            var inserted = rootElement.Element("inserted");
            var deleted = rootElement.Element("deleted");
            return (inserted, deleted);
        }
    }
}

