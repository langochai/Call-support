using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using System.IO;
using System.Threading.Tasks;

namespace CallSupport.Controllers
{
    public class ImagesController : Controller
    {
        private readonly IWebHostEnvironment _hostEnvironment;

        public ImagesController(IWebHostEnvironment appEnvironment)
        {
            _hostEnvironment = appEnvironment;
        }
        [HttpPost]
        [Route("Images/Defect")]
        public async Task<IActionResult> Call([FromForm] IFormFile file)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null) return RedirectToAction("Index", "Login", null);
            
            if (file == null || file.Length == 0) return BadRequest("Please select a file to upload.");
            var uploadPath = Path.Combine(_hostEnvironment.WebRootPath, "uploads/Caller/Defect"); 
            if (!Directory.Exists(uploadPath)) { Directory.CreateDirectory(uploadPath); }
            var filePath = Path.Combine(uploadPath, file.FileName); 
            using (var stream = new FileStream(filePath, FileMode.Create)) { 
                await file.CopyToAsync(stream); 
            }
            return Ok();
        }
    }
}
