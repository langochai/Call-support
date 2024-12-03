using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class ToolsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
