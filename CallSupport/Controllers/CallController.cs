using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class CallController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
