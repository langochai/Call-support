using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class DepartmentsController : Controller
    {
        [HttpGet]
        [Route("/Departments")]
        public IActionResult Index(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var departmentRepo = new DepartmentRepo();
            var departments = departmentRepo.Find(d => d.DepC.Contains(search) || d.DepNm.Contains(search), offset, limit);
            return Json(departments, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
