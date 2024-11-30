using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class ReceiveController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
