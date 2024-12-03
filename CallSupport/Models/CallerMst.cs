using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class CallerMst
    {
        public string CallerC { get; set; }
        public string CallerNm { get; set; }
        public string DepC { get; set; }
        public string CallerPwd { get; set; }
        public string ComputerName { get; set; }
        public DateTime? UpDt { get; set; }
        public string Ipaddress { get; set; }
        public string UserId { get; set; }
    }
}
