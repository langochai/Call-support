using CallSupport.Common;
using CallSupport.Models;
using CallSupport.Models.DTO;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
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
            var isCaller = HttpContext.Session.GetObject<bool>("IsCaller");
            if (user.UserName == null) return StatusCode(401, "Bạn chưa đăng nhập");
            if (!isCaller) return StatusCode(500, "Bạn không có quyền truy cập");
            if (file == null || file.Length == 0) return BadRequest("Please select a file to upload.");
            string basePath = "uploads/Caller/Defect";
            var uploadPath = GetFilePath(basePath);
            var filePath = Path.Combine(uploadPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var imgRepo = new ImgDefectRepo();
            var newImg = new ImagesDefect
            {
                ImgAddress = GetStaticFilePath(basePath, file.FileName),
                UserIdCreated = user.UserName,
                CreatedDate = SQLUtilities.GetDate()
            };
            int id = imgRepo.Create(newImg);
            return Ok(id);
        }
        [HttpPost]
        [Route("Images/BeforeRepair")]
        public async Task<IActionResult> BeforeRepair([FromForm] IFormFile file)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            var isCaller = HttpContext.Session.GetObject<bool>("IsCaller");
            if (user.UserName == null) return StatusCode(401, "Bạn chưa đăng nhập");
            if (isCaller) return StatusCode(500, "Bạn không có quyền truy cập");
            if (file == null || file.Length == 0) return BadRequest("Please select a file to upload.");
            string basePath = "uploads/Repair/Before";
            var uploadPath = GetFilePath(basePath);
            var filePath = Path.Combine(uploadPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var imgRepo = new ImgBeforeRepairRepo();
            var newImg = new ImagesBeforeRepair
            {
                ImgAddress = GetStaticFilePath(basePath, file.FileName),
                UserIdCreated = user.UserName,
                CreatedDate = SQLUtilities.GetDate()
            };
            int id = imgRepo.Create(newImg);
            return Ok(id);
        }
        [HttpPost]
        [Route("Images/AfterRepair")]
        public async Task<IActionResult> AfterRepair([FromForm] IFormFile file)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            var isCaller = HttpContext.Session.GetObject<bool>("IsCaller");
            if (user.UserName == null) return StatusCode(401, "Bạn chưa đăng nhập");
            if (isCaller) return StatusCode(500, "Bạn không có quyền truy cập");
            if (file == null || file.Length == 0) return BadRequest("Please select a file to upload.");
            string basePath = "uploads/Repair/After";
            var uploadPath = GetFilePath(basePath);
            var filePath = Path.Combine(uploadPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var imgRepo = new ImgAfterRepairRepo();
            var newImg = new ImagesAfterRepair
            {
                ImgAddress = GetStaticFilePath(basePath, file.FileName),
                UserIdCreated = user.UserName,
                CreatedDate = SQLUtilities.GetDate()
            };
            int id = imgRepo.Create(newImg);
            return Ok(id);
        }
        private string GetFilePath(string basePath)
        {
            var currentMonth = DateTime.Now.ToString("yyyy-MM");
            var currentDay = DateTime.Now.ToString("dd");
            string filePath = Path.Combine(_hostEnvironment.WebRootPath, basePath.Replace("/", "\\"), currentMonth, currentDay);
            if (!Directory.Exists(filePath)) { Directory.CreateDirectory(filePath); }
            return filePath;
        }
        private string GetStaticFilePath(string basePath, string fileName)
        {
            var currentMonth = DateTime.Now.ToString("yyyy-MM");
            var currentDay = DateTime.Now.ToString("dd");
            return $"/{basePath}/{currentMonth}/{currentDay}/{fileName}";
        }
    }
}
