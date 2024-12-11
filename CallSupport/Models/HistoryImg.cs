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
        public string Tools { get; set; }
        public string DefectNote { get; set; }
        public string RepairNote { get; set; }
        public string DefectImg { get; set; }
        public string BeforeRepairImg { get; set; }
        public string AfterRepairImg { get; set; }
    }
}
