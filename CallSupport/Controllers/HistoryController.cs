using CallSupport.Common;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace CallSupport.Controllers
{
    public class HistoryController : Controller
    {
        [HttpGet]
        public IActionResult Index()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (String.IsNullOrEmpty(user.UserName)) return RedirectToAction("Index", "Login", null);
            ViewBag.User = user;
            ViewBag.Switchable = user.IsCaller ? user.IsRepair : user.IsCaller;
            ViewBag.SwitchURL = user.IsCaller ? "/Repair" : "/Caller";
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
    }
}
