using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class DepMst
    {
        public string DepC { get; set; }
        public string DepNm { get; set; }
        public string DepMusic { get; set; }
        public string ComputerName { get; set; }
        public DateTime? UpDt { get; set; }
        public string Ipaddress { get; set; }
        public string UserId { get; set; }
        public int? Type { get; set; }
        public int? Sort { get; set; }
    }
}
