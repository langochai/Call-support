using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class UserMst
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string GroupMode { get; set; }
        public string UserId { get; set; }
        public DateTime? CreateTime { get; set; }
        public string ComputerName { get; set; }
        public string FullName { get; set; }
        public string UserCreate { get; set; }
        public bool AddPermision { get; set; }
        public bool EditPermision { get; set; }
        public bool DeletePermision { get; set; }
        public bool Permiss { get; set; }
        public bool Depart { get; set; }
        public bool Position { get; set; }
        public bool Workproc { get; set; }
        public bool Line { get; set; }
        public bool Repair { get; set; }
        public bool Call { get; set; }
        public bool Basedefect { get; set; }
        public bool? DefectGroup { get; set; }
        public bool? DefectDetail { get; set; }
    }
}
