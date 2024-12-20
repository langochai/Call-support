using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using System;

namespace CallSupport.Controllers
{
    public class RepairController : Controller
    {
        public IActionResult Index()
        {
            var lastCall = HttpContext.Session.GetObject<HistoryInfoDTO>("LastCall");
            if (lastCall.Line_c == null) return RedirectToAction("Index", "History", new { actionType = "Repair" });
            else return RedirectToAction("Details", new
            {
                time = ((DateTimeOffset)lastCall.Calling_time).ToUnixTimeMilliseconds(),
                line = lastCall.Line_c,
                section = lastCall.Sec_c,
                position = lastCall.Pos_c,
            });
        }
        public IActionResult Details(long time, string line, string section, string position)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair)
            {
                return Forbid("Bạn không có quyền truy cập");
            }
            DateTime callTime = DateTimeOffset.FromUnixTimeMilliseconds(time).DateTime;
            HttpContext.Session.SetObject<HistoryInfoDTO>("LastCall", new HistoryInfoDTO
            {
                Calling_time = callTime,
                Line_c = line,
                Sec_c = section,
                Pos_c = position,
            });
            return View();
        }
    }
}
