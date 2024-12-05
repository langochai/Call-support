using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class MasterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
