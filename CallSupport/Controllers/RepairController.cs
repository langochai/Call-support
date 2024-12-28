using CallSupport.Common;
using CallSupport.Models.DTO;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;

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
            if (!string.IsNullOrEmpty(existingCalls[0].FinishC)) return Forbid("Cuộc gọi đã được xác nhận");
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
        public IActionResult StartRepair(long time, string line, string section, string position, string imgIDs)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair) return Unauthorized("Bạn không có quyền truy cập");
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
                updateIMG.BeforeRepairImg = imgIDs;
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
        public IActionResult EndRepair(long time, string line, string section, string position, string groupCode, string defectCode,
            string imgIDs, string note, bool isStoppedAssy, bool isStoppedQA)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair) return Unauthorized("Bạn không có quyền truy cập");

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
                updateCall.ConfirmTime = SQLUtilities.GetDate();
                updateCall.ConfirmC = user.UserName;
                updateCall.ConfirmDep = user.Department;
                updateCall.ErrC1 = defectCode;
                updateCall.Stopline = isStoppedQA ? 1 : 0;
                updateCall.AssyStop = isStoppedAssy ? 1 : 0;
                updateIMG.AfterRepairImg = imgIDs;
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

        [HttpPost]
        public IActionResult FinalizeRepair(long time, string line, string section, string position, string hashed)
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsRepair) return Unauthorized("Bạn không có quyền truy cập");
            try
            {
                var decryptedText = EncryptionHelper.Decrypt(hashed);
                var data = JsonSerializer.Deserialize<List<string>>(decryptedText);
                if (data.Count != 2) return BadRequest("Mã QR không hợp lệ");
                var callerCode = data[0];
                var QRcreatedDatetime = DateTime.ParseExact(data[1], "yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture);
                if ((QRcreatedDatetime - DateTime.Now).TotalDays > 3) return BadRequest("Mã QR quá cũ, vui lòng tạo mới");

                DateTimeOffset callTimeOffset = DateTimeOffset.FromUnixTimeMilliseconds(time);
                DateTime callTime = callTimeOffset.UtcDateTime.AddHours(7); // Vietnam uses UTC +7
                var existCallRepo = new HistoryRepo();
                var newCallRepo = new HistoryRepo();

                var existingCalls = existCallRepo.Find(h => h.CallingTime == callTime && h.LineC == line &&
                    h.SecC == section && h.PosC == position);
                if (existingCalls.Count == 0) return BadRequest("Dữ liệu không tồn tại hoặc đã bị xóa");
                var updateCall = existingCalls[0];
                updateCall.FinishTime = SQLUtilities.GetDate();
                updateCall.FinishC = callerCode;
                updateCall.DepCFinish = user.Department;
                updateCall.StatusCalling = "2"; // "2" means finished repairing
                newCallRepo.Update(updateCall);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }
    }
}
