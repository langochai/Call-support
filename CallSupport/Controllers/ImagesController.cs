using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class ImagesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
