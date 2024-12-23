using CallSupport.Common;
using CallSupport.Models.DTO;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace CallSupport.Controllers
{
    public class RepairController : Controller
    {
        public IActionResult Index()
        {
            var lastCall = HttpContext.Session.GetObject<HistoryInfoDTO>("LastCall");
            if (lastCall.Line_c == null) return RedirectToAction("Index", "History", new { actionType = "Repair" });
            else return RedirectToAction("Details", new
            {
                time = ((DateTimeOffset)lastCall.Calling_time).ToUnixTimeMilliseconds(),
                line = lastCall.Line_c,
                section = lastCall.Sec_c,
                position = lastCall.Pos_c,
            });
        }
        public IActionResult Details(long time, string line, string section, string position)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair)
            {
                return Forbid("Bạn không có quyền truy cập");
            }
            DateTimeOffset callTimeOffset = DateTimeOffset.FromUnixTimeMilliseconds(time); 
            DateTime callTime = callTimeOffset.UtcDateTime.AddHours(7); // Vietnam uses UTC +7
            var historyRepo = new HistoryRepo();
            var existingCalls = historyRepo.Find(h => h.CallingTime == callTime && h.LineC == line &&
                h.SecC == section && h.PosC == position);
            if (existingCalls.Count == 0) return BadRequest("Dữ liệu không tồn tại hoặc đã bị xóa");
            if (existingCalls[0].ToDepC != user.Department) return Forbid("Bạn không thuộc bộ phận được gọi");
            HttpContext.Session.SetObject<HistoryInfoDTO>("LastCall", new HistoryInfoDTO
            {
                Calling_time = callTime,
                Line_c = line,
                Sec_c = section,
                Pos_c = position,
            });
            return View();
        }
        [HttpPost]
        public IActionResult StartRepair(long time, string line, string section, string position, List<string> imgIDs)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair)
            {
                return Forbid("Bạn không có quyền truy cập");
            }
            DateTimeOffset callTimeOffset = DateTimeOffset.FromUnixTimeMilliseconds(time);
            DateTime callTime = callTimeOffset.UtcDateTime.AddHours(7); // Vietnam uses UTC +7
            var existCallRepo = new HistoryRepo();
            var newCallRepo = new HistoryRepo();
            var existIMGRepo = new HistoryIMGRepo();
            var newIMGRepo = new HistoryIMGRepo();
            try
            {
                var existingCalls = existCallRepo.Find(h => h.CallingTime == callTime && h.LineC == line &&
                    h.SecC == section && h.PosC == position);
                var existingIMG = existIMGRepo.Find(img => img.CallingTime == callTime && img.LineC == line &&
                    img.SecC == section && img.PosC == position);
                if (existingCalls.Count == 0 || existingIMG.Count == 0) return BadRequest("Dữ liệu không tồn tại hoặc đã bị xóa");
                var updateCall = existingCalls[0];
                var updateIMG = existingIMG[0];
                updateCall.RepairingTime = SQLUtilities.GetDate();
                updateCall.RepC = user.UserName;
                updateCall.DepCRep = user.Department;
                updateCall.StatusCalling = "1"; // "1" means start repairing
                updateIMG.AfterRepairImg = String.Join(',', imgIDs);
                newCallRepo.Update(updateCall);
                newIMGRepo.Update(updateIMG);
                return Ok();
            }
            catch (Exception ex) 
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }
        [HttpPost]
        public IActionResult EndRepair(long time, string line, string section, string position, List<string> imgIDs, string note)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair)
            {
                return Forbid("Bạn không có quyền truy cập");
            }
            DateTimeOffset callTimeOffset = DateTimeOffset.FromUnixTimeMilliseconds(time);
            DateTime callTime = callTimeOffset.UtcDateTime.AddHours(7); // Vietnam uses UTC +7
            var existCallRepo = new HistoryRepo();
            var newCallRepo = new HistoryRepo();
            var existIMGRepo = new HistoryIMGRepo();
            var newIMGRepo = new HistoryIMGRepo();
            try
            {
                var existingCalls = existCallRepo.Find(h => h.CallingTime == callTime && h.LineC == line &&
                    h.SecC == section && h.PosC == position);
                var existingIMG = existIMGRepo.Find(img => img.CallingTime == callTime && img.LineC == line &&
                    img.SecC == section && img.PosC == position);
                if (existingCalls.Count == 0 || existingIMG.Count == 0) return BadRequest("Dữ liệu không tồn tại hoặc đã bị xóa");
                var updateCall = existingCalls[0];
                var updateIMG = existingIMG[0];
                updateCall.RepairingTime = SQLUtilities.GetDate();
                updateCall.RepC = user.UserName;
                updateCall.DepCRep = user.Department;
                updateCall.StatusCalling = "2"; // "2" means finished repairing
                updateIMG.AfterRepairImg = String.Join(',', imgIDs);
                updateIMG.RepairNote = note;
                newCallRepo.Update(updateCall);
                newIMGRepo.Update(updateIMG);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }
    }
}
