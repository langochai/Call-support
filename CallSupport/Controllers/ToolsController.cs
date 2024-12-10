using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class ToolsController : Controller
    {
        [HttpGet]
        [Route("/Tools")]
        public IActionResult Get(string search)
        {
            var toolsRepo = new ToolsRepo();
            var tools = toolsRepo.Find(t => t.ToolNm == search || string.IsNullOrEmpty(search));
            return Json(tools, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
