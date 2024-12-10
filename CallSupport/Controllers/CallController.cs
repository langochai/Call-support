using CallSupport.Common;
using CallSupport.Models;
using CallSupport.Models.DTO;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;

namespace CallSupport.Controllers
{
    public class CallController : Controller
    {
        public IActionResult Index()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null) return RedirectToAction("Index", "Login", null);
            ViewBag.User = user;
            ViewBag.Switchable = user.IsRepair;
            ViewBag.SwitchURL = "/Repair";
            return View();
        }
        [HttpPost]
        [Route("/Call")]
        public IActionResult Insert(HistoryMst data) 
        {
            var userInfo = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!userInfo.IsCaller) return StatusCode(403, "Bạn không có quyền truy cập");
            var historyRepo = new HistoryRepo();
            var existingCalls = historyRepo.Find(h =>
                (h.StatusCalling == "0" || h.StatusCalling == "1") && h.LineC == data.LineC &&
                h.SecC == data.SecC && h.ToDepC == data.ToDepC
            );
            if (existingCalls.Count > 0) return StatusCode(409, $"Dây chuyền {data.LineC} công đoạn {data.SecC} vẫn đang gọi");
            try
            {
                var currentTime = TextUtils.GetDate();
                var insertData = new HistoryMst
                {
                    CallingTime = currentTime,
                    CallerC = data.CallerC,
                    DepC = data.DepC,
                    StatusCalling = "0", // why the hell is this a string? the guy who made this DB had problems
                    LineC = data.LineC,
                    SecC = data.SecC,
                    PosC = data.PosC,
                    UptDt = currentTime,
                    ToDepC = data.ToDepC,
                    ErrC = data.ErrC,
                    StatusLine = data.StatusLine,
                    Ipaddress = userInfo.Ipaddress,
                };
                historyRepo.Create(insertData);
                return Ok();
            }
            catch(Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
