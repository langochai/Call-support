using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class GroupdefectMst
    {
        public string GroupdefectC { get; set; }
        public string GroupdefectNm { get; set; }
        public string UserId { get; set; }
        public string ComputerName { get; set; }
        public string Ipaddress { get; set; }
        public DateTime? UpDt { get; set; }
        public string DepC { get; set; }
        public int? Sort { get; set; }
    }
}
