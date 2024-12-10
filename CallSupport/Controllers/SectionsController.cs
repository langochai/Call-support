using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallSupport.Controllers
{
    public class SectionsController : Controller
    {
        [HttpGet]
        [Route("/Sections")]
        public IActionResult Index(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var sectionRepo = new SectionRepo();
            var sections = sectionRepo.Find(s => s.SecC.Contains(search) || EF.Functions.Like(s.SecNm, $"%{search}%"),
                offset, limit, s => s.Sort);
            return Json(sections, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
