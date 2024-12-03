using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class PositionsController : Controller
    {
        [HttpGet]
        [Route("/Positions")]
        public IActionResult Index(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var positionRepo = new PositionRepo();
            var postions = positionRepo.Find(p => p.PosC.Contains(search), offset, limit);
            return Json(postions, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
