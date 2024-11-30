using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            string UserName = HttpContext.Session.GetString("UserName");
            if (UserName == null)
            {
                return RedirectToAction("Index", "Login", null);
            }
            ViewBag.UserName = UserName;
            return View();
        }
        public IActionResult Error()
        {
            return View();
        }
    }
}
