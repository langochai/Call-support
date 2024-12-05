namespace CallSupport.Models.DTO
{
    public class AuthInfoDTO
    {
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Department { get; set; }
        public string Password { get; set; }
        public bool IsCaller { get; set; }
        public bool IsRepair { get; set; }
        public bool IsMaster { get; set; }
    }
}
