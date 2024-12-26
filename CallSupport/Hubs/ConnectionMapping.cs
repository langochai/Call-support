using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace CallSupport.Hubs
{
    public class ConnectionMapping
    {
        private readonly ConcurrentDictionary<string, ConnectionData> _connections =
            new ConcurrentDictionary<string, ConnectionData>();

        public int Count => _connections.Count;

        public void Add(string connectionId, ConnectionData data)
        {
            _connections[connectionId] = data; // Add or update the connection with its associated data
        }

        public void Remove(string connectionId)
        {
            _connections.TryRemove(connectionId, out _);
        }

        public List<string> GetConnections(string department, bool isCaller)
        {
            return _connections
                .Where(kv => kv.Value.Department == department && kv.Value.IsCaller == isCaller)
                .Select(kv => kv.Key).ToList();
        }

        public IEnumerable<(string ConnectionId, ConnectionData Data)> GetAllConnections()
        {
            return _connections.Select(kv => (kv.Key, kv.Value));
        }
    }

    public class ConnectionData
    {
        public string UserName { get; set; }
        public string Department { get; set; }
        public bool IsCaller { get; set; }
    }
}
