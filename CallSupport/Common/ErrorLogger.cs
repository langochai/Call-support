using System.IO;
using System;

namespace CallSupport.Common
{
    public class ErrorLogger
    {
        public static string logFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "log.txt");
        public static void Write(Exception exception)
        {
            string logMessage = $"[{DateTime.Now}] Error: {exception.Message}\n{exception.StackTrace}\n\n";

            File.AppendAllText(logFilePath, logMessage);
        }
    }
}
