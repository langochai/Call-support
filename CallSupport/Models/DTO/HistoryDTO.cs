using System;

namespace CallSupport.Models.DTO
{
    public class HistoryDTO : HistoryMst
    {
        public string Tools { get; set; }
        public string DefectNote { get; set; }
        public string RepairNote { get; set; }
        public string DefectImg { get; set; }
        public string BeforeRepairImg { get; set; }
        public string AfterRepairImg { get; set; }
        public string LineNm { get; set; }
        public string SecNm { get; set; }
        public string PosNm { get; set; }
        public string DepNm { get; set; }
        public string Tenloi { get; set; }
    }
}
