using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class PosMst
    {
        public string PosC { get; set; }
        public string PosNm { get; set; }
        public string PosMusic { get; set; }
        public string ComputerName { get; set; }
        public DateTime? UpDt { get; set; }
        public string Ipaddress { get; set; }
        public string UserId { get; set; }
        public int? Sort { get; set; }
    }
}
