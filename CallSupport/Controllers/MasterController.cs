using CallSupport.Common;
using CallSupport.Models.DTO;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using Path = System.IO.Path;

namespace CallSupport.Controllers
{
    public class MasterController : Controller
    {
        public IActionResult Index()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (!user.IsMaster) return StatusCode(403, "Bạn không có quyền truy cập.");
            return View();
        }
        public IActionResult ExportExcel(string fromDep, string toDep, string lines, string status,
            DateTime fromDate, DateTime toDate)
        {
            try
            {
                string excelFilename = $"CallHistory.xlsx";
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/assets/" + excelFilename);
                using var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                using var workbook = new XLWorkbook(stream);
                var worksheet = workbook.Worksheet(1);

                var callList = SQLHelper<HistoryListDTO>.ProcedureToList("spGetHistoryList",
                    new string[] { "@FromDep", "@ToDep", "@FromLines", "@Status", "@FromDate", "@ToDate", "@Offset", "@Limit" },
                    new object[] { fromDep, toDep, lines, status, fromDate, toDate, null, null });
                if (callList.Count > 200) return BadRequest("Dữ liệu quá lớn, vui lòng sử dụng bộ lọc để chọn dữ liệu cần thiết");
                int startRow = 6;
                foreach (var call in callList)
                {
                    var callDetails = SQLHelper<HistoryListDTO>.ProcedureToList("spGetHistoryDetails",
                        new string[] { "@CallingTime", "@LineCode", "@SectionCode", "@PositionCode" },
                        new object[] { call.Calling_time, call.Line_c, call.Sec_c, call.Pos_c });
                    int startCol = 1;
                    foreach (var detail in callDetails)
                    {
                        worksheet.Cell(startRow, startCol++).Value = detail.Line_c;
                        worksheet.Cell(startRow, startCol++).Value = detail.Line_nm;
                        worksheet.Cell(startRow, startCol++).Value = detail.Sec_c;
                        worksheet.Cell(startRow, startCol++).Value = detail.Pos_c;
                        worksheet.Cell(startRow, startCol++).Value = detail.Calling_time.ToString("dd/MM/yyyy HH:mm:ss");
                        worksheet.Cell(startRow, startCol++).Value = detail.CallerName;
                        startCol++; // Hình ảnh gọi
                        worksheet.Cell(startRow, startCol++).Value = detail.defect_note;
                        worksheet.Cell(startRow, startCol++).Value = detail.Dep_c;
                        worksheet.Cell(startRow, startCol++).Value = detail.Repairing_time?.ToString("dd/MM/yyyy HH:mm:ss");
                        worksheet.Cell(startRow, startCol++).Value = detail.RepairerName;
                        worksheet.Cell(startRow, startCol++).Value = detail.ToDep_c;
                        worksheet.Cell(startRow, startCol++).Value = GetTimeSpan(detail.Repairing_time , detail.Calling_time);
                        worksheet.Cell(startRow, startCol++).Value = detail.Err_c1;
                        worksheet.Cell(startRow, startCol++).Value = detail.tenloiChiTiet;
                        worksheet.Cell(startRow, startCol++).Value = detail.Confirm_time?.ToString("dd/MM/yyyy HH:mm:ss");
                        worksheet.Cell(startRow, startCol++).Value = GetTimeSpan(detail.Confirm_time, detail.Repairing_time);
                        worksheet.Cell(startRow, startCol++).Value = detail.RepairerName;
                        worksheet.Cell(startRow, startCol++).Value = detail.Status_calling == "0" ? "Đang chờ" :
                                                                    detail.Status_calling == "1" ? "Đang sửa chữa" :
                                                                    detail.Status_calling == "2" ? "Đã xác nhận" : "";
                        worksheet.Cell(startRow, startCol++).Value = GetTimeSpan(detail.Confirm_time, detail.Calling_time);
                        startCol++; // Hình ảnh trước khi sửa
                        startCol++; // Hình ảnh sau khi sửa
                        worksheet.Cell(startRow, startCol++).Value = detail.repair_note;

                        AddImagesToWorksheet(worksheet, detail.DefectImg, startRow, 7);
                        AddImagesToWorksheet(worksheet, detail.BeforeRepairImg, startRow, 21);
                        AddImagesToWorksheet(worksheet, detail.AfterRepairImg, startRow, 22);
                        startRow++;
                    }
                }
                using var newStream = new MemoryStream();
                workbook.SaveAs(newStream);
                newStream.Seek(0, SeekOrigin.Begin);
                return File(newStream.ToArray(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"Lịch sử gọi {DateTime.Now:dd_MM_yyyy}.xlsx");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
        private void AddImagesToWorksheet(IXLWorksheet worksheet, string images, int startRow, int columnNumber)
        {
            if (String.IsNullOrEmpty(images)) return;
            foreach (var img in images.Split(","))
            {
                string imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot" + img);
                var imgWidth = (int)worksheet.Cell(startRow, columnNumber).WorksheetColumn().Width * 7;
                var imgHeight = (int)worksheet.Cell(startRow, columnNumber).WorksheetRow().Height + 20;

                worksheet.AddPicture(imagePath)
                    .MoveTo(worksheet.Cell(startRow, columnNumber))
                    .WithSize(imgWidth, imgHeight);
            }
        }
        private string GetTimeSpan(DateTime? from, DateTime? to)
        {
            if (!from.HasValue || !to.HasValue) return "";
            TimeSpan? duration = from.Value - to.Value;
            return duration.Value.ToString(@"hh\:mm\:ss");
        }
    }
}
