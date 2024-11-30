using CallSupport.Common;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace CallSupport.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            ViewData["Title"] = "Đăng nhập";
            return View();
        }
        [HttpPost]
        [Route("/Login")]
        public IActionResult Login(string username, string password)
        {
            var userRepo = new UsersRepo();
            var user = userRepo.Find(u => u.UserName == username && u.Password == password).FirstOrDefault();
            if (user == null || user.UserName == "") return StatusCode(401, "Sai tên đăng nhập hoặc mật khẩu !");
            HttpContext.Session.SetString("UserName", TextUtils.ToString(user.UserName));
            HttpContext.Session.SetString("Password", TextUtils.ToString(user.Password));

            return Ok("/");
        }
        [HttpPost]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}
