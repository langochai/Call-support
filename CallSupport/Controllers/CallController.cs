using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class CallController : Controller
    {
        public IActionResult Index()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null)
            {
                return RedirectToAction("Index", "Login", null);
            }
            ViewBag.UserName = user.UserName;
            ViewBag.FullName = user.FullName;
            ViewBag.Switchable = user.IsRepair;
            ViewBag.SwitchURL = "/Repair";
            return View();
        }
    }
}
