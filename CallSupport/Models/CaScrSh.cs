using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class CaScrSh
    {
        public DateTime CallingTime { get; set; }
        public string CallerC { get; set; }
        public string DepC { get; set; }
        public DateTime? RepairingTime { get; set; }
        public string RepC { get; set; }
        public string DepCRep { get; set; }
        public string ErrC1 { get; set; }
        public DateTime? FinishTime { get; set; }
        public string FinishC { get; set; }
        public string DepCFinish { get; set; }
        public DateTime? CancelTime { get; set; }
        public string CancelC { get; set; }
        public string DepCCancel { get; set; }
        public string StatusCalling { get; set; }
        public string LineC { get; set; }
        public string SecC { get; set; }
        public string PosC { get; set; }
        public string ComputerName { get; set; }
        public string Ipaddress { get; set; }
        public DateTime? UptDt { get; set; }
        public string ToDepC { get; set; }
        public string ErrC { get; set; }
        public int? Stopline { get; set; }
        public int? AssyStop { get; set; }
        public string Ver { get; set; }
        public string ConfirmDep { get; set; }
        public string ConfirmC { get; set; }
        public DateTime? ConfirmTime { get; set; }
        public bool StatusLine { get; set; }
        public string StatusUpdateUser { get; set; }
        public DateTime? StatusDatetime { get; set; }
        public string StatusUpdateDep { get; set; }
        public int SoGioSuaThucTe { get; set; }
        public int SoGioNghiGiuaGio { get; set; }
    }
}
