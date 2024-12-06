using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class DefectsController : Controller
    {
        [HttpGet]
        [Route("/Defects")]
        public IActionResult Index(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var DefectRepo = new QADefectRepo();
            var defects = DefectRepo.Find(d => d.Maloi.Contains(search) || d.Tenloi.Contains(search), offset, limit);
            return Json(defects, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
