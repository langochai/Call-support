using System;

namespace CallSupport.Models.DTO
{
    public class HistoryListDTO 
    {
        public DateTime Calling_time { get; set; }
        public string Caller_c { get; set; }
        public string Dep_c { get; set; }
        public string Status_calling { get; set; }
        public string Line_c { get; set; }
        public string Sec_c { get; set; }
        public string Pos_c { get; set; }
        public string ComputerName { get; set; }
        public string Ipaddress { get; set; }
        public string Err_c { get; set; }
        public DateTime? Repairing_time { get; set; }
        public string Rep_c { get; set; }
        public string Dep_c_rep { get; set; }
        public string Err_c1 { get; set; }
        public DateTime? Finish_time { get; set; }
        public string Finish_c { get; set; }
        public string Dep_c_finish { get; set; }
        public DateTime? Cancel_time { get; set; }
        public string Cancel_c { get; set; }
        public string Dep_c_cancel { get; set; }
        public DateTime? UptDt { get; set; }
        public string To_dep_c { get; set; }
        public int? Stopline { get; set; }
        public int? AssyStop { get; set; }
        public string Ver { get; set; }
        public string Confirm_dep { get; set; }
        public string Confirm_c { get; set; }
        public DateTime? Confirm_time { get; set; }
        public bool Status_line { get; set; }
        public string Status_Update_User { get; set; }
        public DateTime? Status_Datetime { get; set; }
        public string Status_Update_Dep { get; set; }
        public int SoGioSuaThucTe { get; set; }
        public int SoGioNghiGiuaGio { get; set; }
        public string Tools { get; set; }
        public string DefectNote { get; set; }
        public string RepairNote { get; set; }
        public string DefectImg { get; set; }
        public string BeforeRepairImg { get; set; }
        public string AfterRepairImg { get; set; }
        public string Line_nm { get; set; }
        public string Sec_nm { get; set; }
        public string Pos_nm { get; set; }
        public string Dep_nm { get; set; }
        public string tenloi { get; set; }
    }
}
