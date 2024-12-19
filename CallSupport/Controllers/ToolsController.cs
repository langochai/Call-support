using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallSupport.Controllers
{
    public class ToolsController : Controller
    {
        [HttpGet]
        [Route("/Tools")]
        public IActionResult Get(string search)
        {
            var toolsRepo = new ToolsRepo();
            var tools = toolsRepo.Find(t => EF.Functions.Like(t.ToolNm, $"%{search}%"));
            return Json(tools, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
