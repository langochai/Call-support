using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CallSupport.Controllers
{
    public class DepartmentsController : Controller
    {
        [HttpGet]
        [Route("/Departments")]
        public IActionResult Index(string search)
        {
            var departmentRepo = new DepartmentRepo();
            var departments = departmentRepo.Find(d => d.DepC.Contains(search) || d.DepNm.Contains(search));
            return Json(departments, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
