﻿using CallSupport.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CallSupport.Controllers
{
    public class DefectsController : Controller
    {
        [HttpGet]
        [Route("/Defects")]
        public IActionResult Index(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var DefectRepo = new QADefectRepo();
            var defects = DefectRepo.Find(d => d.Maloi.Contains(search) || EF.Functions.Like(d.Tenloi, $"%{search}%"),
                offset, limit, d => d.Sort);
            return Json(defects, new System.Text.Json.JsonSerializerOptions());
        }
        [HttpGet]
        [Route("/GroupDefects")]
        public IActionResult GroupDefect(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var DefectRepo = new GroupDefectRepo();
            var defects = DefectRepo.Find(d => d.GroupdefectC.Contains(search) || EF.Functions.Like(d.GroupdefectNm, $"%{search}%"),
                offset, limit, d => d.Sort);
            return Json(defects, new System.Text.Json.JsonSerializerOptions());
        }
        [HttpGet]
        [Route("/DetailedDefects")]
        public IActionResult DetailedDefect(string search = "", int offset = 0)
        {
            int limit = 10; //number of returned rows
            var DefectRepo = new DetailedDefectRepo();
            var defects = DefectRepo.Find(d => d.Maloi.Contains(search) || EF.Functions.Like(d.Tenloi, $"%{search}%"),
                offset, limit, d => d.Sort);
            return Json(defects, new System.Text.Json.JsonSerializerOptions());
        }
    }
}
