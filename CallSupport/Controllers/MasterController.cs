using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class MasterController : Controller
    {
        public IActionResult Index()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsMaster) return StatusCode(403, "Bạn không có quyền truy cập.");
            return View();
        }
    }
}
