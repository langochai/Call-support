using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class DefectsController : Controller
    {
        [HttpGet]
        [Route("/Defects")]
        public IActionResult Index(string search)
        {
            var DefectRepo = new DefectRepo();
            var defects = DefectRepo.Find(d => d.Maloi.Contains(search) || d.Tenloi.Contains(search));
            return Json(defects, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
