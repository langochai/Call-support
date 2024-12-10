using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using System;

namespace CallSupport.Controllers
{
    public class HistoryController : Controller
    {
        [HttpGet]
        public IActionResult Call()
        {
            var userInfo = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!userInfo.IsCaller) return StatusCode(403, "Bạn không có quyền truy cập");
            return View();
        }
        [HttpGet]
        public IActionResult Repair()
        {
            var userInfo = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!userInfo.IsRepair) return StatusCode(403, "Bạn không có quyền truy cập");
            return View();
        }
        [HttpGet]
        [Route("/History/Details")]
        public IActionResult HistoryDetails(DateTime callTime, string line, string section, string postion)
        {
            var userInfo = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!userInfo.IsCaller) return StatusCode(403, "Bạn không có quyền truy cập");
            return View();
        }
    }
}
