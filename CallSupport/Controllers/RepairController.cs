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
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null)
            {
                return RedirectToAction("Index", "Login", null);
            }
            ViewBag.User = user;
            ViewBag.Switchable = user.IsCaller;
            ViewBag.SwitchURL = "/Call";
            return View();
        }
        public IActionResult Details(DateTime time, string line, string section, string position)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair)
            {
                return Forbid("Bạn không có quyền truy cập");
            }
            ViewBag.User = user;
            ViewBag.Switchable = user.IsCaller;
            ViewBag.SwitchURL = "/Call";
            return View();
        }
    }
}
