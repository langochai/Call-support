using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class HistoryImg
    {
        public DateTime CallingTime { get; set; }
        public string LineC { get; set; }
        public string SecC { get; set; }
        public string PosC { get; set; }
        public string Note { get; set; }
        public string DefectImg { get; set; }
        public string RepairImg { get; set; }
        public string CompleteImg { get; set; }
        public string SupplyImg { get; set; }
    }
}
