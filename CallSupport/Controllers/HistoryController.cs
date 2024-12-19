using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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
            if (actionType != "Call" && actionType != "Repair") return NotFound();
            ViewBag.User = user;
            ViewBag.Switchable = user.IsCaller ? user.IsRepair : user.IsCaller;
            ViewBag.SwitchURL = actionType == "Call" ? "/Repair" : "/Call";
            return View();
        }
        [HttpGet]
        public IActionResult Data(string fromDep, string toDep, string lines,
            DateTime fromDate, DateTime toDate, int offset, int limit = 2000)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (String.IsNullOrEmpty(user.UserName)) return Forbid();
            var data = SQLHelper<HistoryListDTO>.ProcedureToList("spGetHistoryList",
                new string[] { "@FromDep", "@ToDep", "@FromLines", "@FromDate", "@ToDate", "@Offset", "@Limit" },
                new object[] { fromDep, toDep, lines, fromDate, toDate, offset, limit });
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
    }
}
