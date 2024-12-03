using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class SectionsController : Controller
    {
        [HttpGet]
        [Route("/Sections")]
        public IActionResult Index(string search)
        {
            var sectionRepo = new SectionRepo();
            var sections = sectionRepo.Find(s => s.SecC.Contains(search) || s.SecNm.Contains(search));
            return Json(sections, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
