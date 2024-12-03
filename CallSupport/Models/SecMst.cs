using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class SecMst
    {
        public string SecC { get; set; }
        public string SecNm { get; set; }
        public string SecMusic { get; set; }
        public string ComputerName { get; set; }
        public DateTime? UpDt { get; set; }
        public string Ipaddress { get; set; }
        public string UserId { get; set; }
        public int? Sort { get; set; }
    }
}
