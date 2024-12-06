using CallSupport.Models.DTO;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CallSupport.Hubs
{
    public class ConnectionMapping
    {
        private readonly Dictionary<UserInfo, HashSet<string>> _connections =
            new Dictionary<UserInfo, HashSet<string>>();

        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public void Add(UserInfo key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public void Remove(UserInfo key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }

        public IEnumerable<string> GetConnections(UserInfo key)
        {
            var matchedConnections = _connections
                .Where(kv => MatchUserInfo(kv.Key, key))
                .SelectMany(kv => kv.Value);

            return matchedConnections.Any() ? matchedConnections : Enumerable.Empty<string>();
        }

        #region Match User Info

        private bool MatchUserInfo(UserInfo stored, UserInfo query)
        {
            if (!string.IsNullOrEmpty(query.UserName) && !stored.UserName.Equals(query.UserName, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!string.IsNullOrEmpty(query.Department) && !stored.Department.Equals(query.Department, StringComparison.OrdinalIgnoreCase))
                return false;

            if (query.IsCaller != stored.IsCaller)
                return false;

            return true;
        }

        #endregion Match User Info
    }
}