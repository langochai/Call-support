using CallSupport.Common;
using CallSupport.Models;
using CallSupport.Models.DTO;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Threading.Tasks;

namespace CallSupport.Controllers
{
    public class ToolsController : Controller
    {
        private readonly IWebHostEnvironment _hostEnvironment;
        public ToolsController(IWebHostEnvironment appEnvironment)
        {
            _hostEnvironment = appEnvironment;
        }
        [HttpGet]
        [Route("/Tools")]
        public IActionResult Get(string search)
        {
            var toolsRepo = new ToolsRepo();
            var tools = toolsRepo.Find(t => EF.Functions.Like(t.ToolNm, $"%{search}%"));
            return Json(tools, new System.Text.Json.JsonSerializerOptions());
        }
        [HttpPost]
        public async Task<IActionResult> Create(string name, IFormFile file)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsMaster) return Unauthorized("Bạn không có quyền truy cập");
            if (file == null || file.Length == 0) return BadRequest("Please select a file to upload");
            string basePath = "uploads/Tools";
            var uploadPath = GetFilePath(basePath);
            var filePath = Path.Combine(uploadPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var toolsRepo = new ToolsRepo();
            toolsRepo.Create(new Tools
            {
                ToolNm = name,
                Img = $"/uploads/Tools/{file.FileName}",
                UserIdCreated = user.UserName,
                CreatedDate = SQLUtilities.GetDate(),
            });
            return Ok();
        }
        [HttpPost]
        public async Task<IActionResult> Update(int id, string name, IFormFile file)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsMaster) return Unauthorized("Bạn không có quyền truy cập");
            if (file == null || file.Length == 0) return BadRequest("Please select a file to upload");
            string basePath = "uploads/Tools";
            var uploadPath = GetFilePath(basePath);
            var filePath = Path.Combine(uploadPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var toolsRepo = new ToolsRepo();
            toolsRepo.Update(new Tools
            {
                Id = id,
                ToolNm = name,
                Img = $"/uploads/Tools/{file.FileName}",
                UserIdCreated = user.UserName,
                CreatedDate = SQLUtilities.GetDate(),
            });
            return Ok();
        }
        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsMaster) return Unauthorized("Bạn không có quyền truy cập");
            var toolsRepo = new ToolsRepo();
            try
            {
                toolsRepo.Delete(id);
                return Ok();
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        private string GetFilePath(string basePath)
        {
            string filePath = Path.Combine(_hostEnvironment.WebRootPath, basePath.Replace("/", "\\"));
            if (!Directory.Exists(filePath)) { Directory.CreateDirectory(filePath); }
            return filePath;
        }
    }
}
