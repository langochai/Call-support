using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class LinesController : Controller
    {
        [HttpGet]
        [Route("/Lines")]
        public IActionResult Index(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var lineRepo = new LineRepo();
            var lines = lineRepo.Find(l => l.LineC.Contains(search) || l.LineNm.Contains(search), offset, limit);
            return Json(lines, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
