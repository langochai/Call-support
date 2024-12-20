using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null)
            {
                return RedirectToAction("Index", "Login", null);
            }
            if (user.IsCaller)
            {
                HttpContext.Session.SetObject<bool>("IsCaller", true);
                return RedirectToAction("Index", "Call", null);
            }
            if (user.IsRepair)
            {
                HttpContext.Session.SetObject<bool>("IsCaller", false);
                return RedirectToAction("Index", "History", new { actionType = "Repair" });
            }
            if (user.IsMaster)
            {
                return RedirectToAction("Index", "Master", null);
            }
            return RedirectToAction("Error");
        }
        public IActionResult Error()
        {
            return View();
        }
        public IActionResult ChangePermission()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            var isCaller = HttpContext.Session.GetObject<bool>("IsCaller");
            if (user.UserName == null)
            {
                return RedirectToAction("Index", "Login", null);
            }
            if (user.IsMaster)
            {
                return RedirectToAction("Index", "Master", null);
            }
            if (isCaller)
            {
                HttpContext.Session.SetObject<bool>("IsCaller", false);
                return RedirectToAction("Index", "History", new { actionType = "Repair" });
            }
            if (!isCaller)  // didn't use `else` here just in case we need another permission, which is highly possible
            {
                HttpContext.Session.SetObject<bool>("IsCaller", true);
                return RedirectToAction("Index", "Call", null);
            }
            return RedirectToAction("Error");
        }
    }
}
