using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Text.Json;

namespace CallSupport.Controllers
{
    public class HistoryController : Controller
    {
        [HttpGet]
        [Route("History/{actionType}")]
        public IActionResult Index(string actionType)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (String.IsNullOrEmpty(user.UserName)) return RedirectToAction("Index", "Login", null);
            if (actionType.ToLower() != "call" && actionType.ToLower() != "repair") return NotFound();
            return View();
        }
        [HttpGet]
        public IActionResult Data(string fromDep, string toDep, string lines, string status,
            DateTime fromDate, DateTime toDate, int offset, int limit = 2000)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (String.IsNullOrEmpty(user.UserName)) return Forbid();
            var data = SQLHelper<HistoryListDTO>.ProcedureToList("spGetHistoryList",
                new string[] { "@FromDep", "@ToDep", "@FromLines", "@Status", "@FromDate", "@ToDate", "@Offset", "@Limit" },
                new object[] { fromDep, toDep, lines, status, fromDate, toDate, offset, limit });
            return Json(data, new System.Text.Json.JsonSerializerOptions());
        }
        [HttpGet]
        public IActionResult Details(DateTime callingTime, string line, string section, string position)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (String.IsNullOrEmpty(user.UserName)) return Forbid();
            var data = SQLHelper<HistoryListDTO>.ProcedureToList("spGetHistoryDetails",
                new string[] { "@CallingTime", "@LineCode", "@SectionCode", "@PositionCode" },
                new object[] { callingTime, line, section, position });
            return Json(data, new System.Text.Json.JsonSerializerOptions());
        }
        [HttpGet]
        public IActionResult QRCode(DateTime callingTime, string line, string section, string position)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (String.IsNullOrEmpty(user.UserName)) return Forbid();
            if (!user.IsCaller) return Unauthorized("Bạn không có quyền truy cập");
            var data = SQLHelper<HistoryListDTO>.ProcedureToList("spGetHistoryDetails",
                new string[] { "@CallingTime", "@LineCode", "@SectionCode", "@PositionCode" },
                new object[] { callingTime, line, section, position });
            if (user.Department != data[0].Dep_c) return BadRequest("Bạn không thuộc bộ phận gọi");
            string[] confirmInfo = new string[]
            {
                user.UserName,
                DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
            };
            string responseText = EncryptionHelper.Encrypt(JsonSerializer.Serialize(confirmInfo));
            return Ok(responseText);
        }
    }
}
