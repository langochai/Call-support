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
                return RedirectToAction("Index", "Call", null);
            }
            if (user.IsRepair)
            {
                return RedirectToAction("Index", "Support", null);
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
    }
}
