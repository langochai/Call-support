using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            var departments = departmentRepo.Find(d => d.DepC.Contains(search) || EF.Functions.Like(d.DepNm, $"%{search}%"),
                offset, limit, d => d.Sort);
            return Json(departments, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
