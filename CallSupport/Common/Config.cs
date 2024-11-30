namespace CallSupport.Common
{
    public static class Config
    {
        /// <summary>
        /// Môi trường chạy
        /// 1: Môi trường Publish lên server
        /// 0: Môi trường Test trên local
        /// </summary>
        ///
        public static int _environment = 0;

        //public static string _folderName = @"D:\TemplateExcel";
        //public static string _fileNameDailyReport = "DS_DailyReport.xlsx";

        public static string Connection()
        {
            string conn = "";
            if (_environment == 0)
            {
                conn = Startup.ConnectionString;
            }
            else
            {
                conn = @"";
            }

            return conn;
        }

        public static string Employees = "Employees_Sumi";
    }
}