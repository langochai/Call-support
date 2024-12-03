using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class RepMst
    {
        public string RepC { get; set; }
        public string RepNm { get; set; }
        public string DepC { get; set; }
        public string RepPwd { get; set; }
        public string ComputerName { get; set; }
        public DateTime? UpDt { get; set; }
        public string Ipaddress { get; set; }
        public string UserId { get; set; }
    }
}
