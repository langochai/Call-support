using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class LineMst
    {
        public string LineC { get; set; }
        public string LineNm { get; set; }
        public string LineMusic { get; set; }
        public string ComputerName { get; set; }
        public DateTime? UpDt { get; set; }
        public string Ipaddress { get; set; }
        public string UserId { get; set; }
        public int? Sort { get; set; }
    }
}
