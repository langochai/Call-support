using CallSupport.Common;
using CallSupport.Models;
using CallSupport.Models.DTO;
using CallSupport.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Linq;

namespace CallSupport.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Index()
        {
            ViewData["Title"] = "Đăng nhập";
            return View();
        }

        [HttpPost]
        [Route("/Login")]
        public IActionResult Login(string username, string password, bool remember, bool asMaster)
        {
            if (!asMaster)
            {
                var user = SQLHelper<AuthInfoDTO>.ProcedureToModel("spGetUserData",
                new string[] { "@UserName", "@Password" },
                new object[] { username, password });
                if (user == null || string.IsNullOrEmpty(user.UserName)) return StatusCode(401, "Sai tên đăng nhập!");
                HttpContext.Session.SetObject<AuthInfoDTO>("User", user);
                HttpContext.Session.SetObject<bool>("IsMaster", false);
                HttpContext.Session.SetObject<bool>("IsCaller", user.IsCaller);
                string userInfoJSON = JsonConvert.SerializeObject(user);
                string credentials = remember ? EncryptionHelper.Encrypt(userInfoJSON) : "";
                return Ok(credentials);
            }
            else
            {
                var userRepo = new UsersRepo();
                var user = userRepo.Find(u => u.UserName == username && u.Password == password);
                if (user.Count != 1) return StatusCode(401, "Sai tên đăng nhập hoặc mật khẩu!");
                AuthInfoDTO auth = new AuthInfoDTO
                {
                    UserName = username,
                    Password = password,
                    FullName = user[0].FullName,
                    Department = user[0].GroupMode,
                    IsMaster = true
                };
                HttpContext.Session.SetObject<AuthInfoDTO>("User", auth);
                HttpContext.Session.SetObject<bool>("IsMaster", true);
                return Ok();
            }
        }

        [HttpGet]
        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }

        [HttpPost]
        public IActionResult CheckCredentials(string credentials)
        {
            if (string.IsNullOrEmpty(credentials)) return BadRequest();
            string decryptedText = EncryptionHelper.Decrypt(credentials);
            var userInfo = JsonConvert.DeserializeObject<UserMst>(decryptedText);
            var existingUser = SQLHelper<AuthInfoDTO>.ProcedureToModel("spGetUserData",
                new string[] { "@UserName", "@Password" },
                new object[] { userInfo.UserName, userInfo.Password });
            if (existingUser != null || !string.IsNullOrEmpty(existingUser.UserName))
            {
                HttpContext.Session.SetObject<AuthInfoDTO>("User", existingUser);
                return Ok();
            }
            else return StatusCode(406, "Nice try funny man");
        }
        [HttpPost]
        public IActionResult QRcodeLogin([FromBody] string credentials)
        {
            try
            {
                if (string.IsNullOrEmpty(credentials)) return BadRequest();
                var decrypted = EncryptionHelper.Decrypt(credentials);
                var userInfo = decrypted.Split(";;;"); // 3 semicolons from the custom format above
                if (userInfo.Length != 2) return Forbid("Bruh that's not right");
                var user = SQLHelper<AuthInfoDTO>.ProcedureToModel("spGetUserData",
                    new string[] { "@UserName", "@Password" },
                    new object[] { userInfo[0], userInfo[1] });
                if (user == null || string.IsNullOrEmpty(user.UserName)) return Forbid("BRUH What the hell?");
                HttpContext.Session.SetObject<AuthInfoDTO>("User", user);
                return Ok();
            }
            catch(Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet]
        public IActionResult QRcode()
        {
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null) return Forbid("Xác thực thất bại");
            string credentials = EncryptionHelper.Encrypt($"{user.UserName};;;{user.Password}"); //custom format to reduce length
            return Ok(credentials);
        }
        [HttpPost]
        public IActionResult ChangePassword(string oldPassword, string newPassword)
        {
            bool isMaster = HttpContext.Session.GetObject<bool>("IsMaster");
            bool isCaller = HttpContext.Session.GetObject<bool>("IsCaller");
            var user = HttpContext.Session.GetObject<AuthInfoDTO>("User");
            if (user.UserName == null) return Forbid("Xác thực thất bại");
            if (isMaster)
            {
                var existingUserRepo = new UsersRepo(); // need two repo because entity doesnt allow changing tracked record
                var newUserRepo = new UsersRepo();
                var existingUser = existingUserRepo.Find(u => u.UserName == user.UserName && u.Password == oldPassword);
                if (existingUser.Count == 0) return BadRequest("Mật khẩu cũ không chính xác");
                var newUser = existingUser[0];
                newUser.Password = newPassword;
                newUserRepo.Update(newUser);
            }
            else
            {
                if (isCaller)
                {
                    var existingUserRepo = new CallerRepo();
                    var newUserRepo = new CallerRepo();
                    var existingUser = existingUserRepo.Find(u => u.CallerC == user.UserName && u.CallerPwd == oldPassword);
                    if (existingUser.Count == 0) return BadRequest("Mật khẩu cũ không chính xác");
                    var newUser = existingUser[0];
                    newUser.CallerPwd = newPassword;
                    newUserRepo.Update(newUser);
                }
                else
                {
                    var existingUserRepo = new RepairerRepo();
                    var newUserRepo = new RepairerRepo();
                    var existingUser = existingUserRepo.Find(u => u.RepC == user.UserName && u.RepPwd == oldPassword);
                    if (existingUser.Count == 0) return BadRequest("Mật khẩu cũ không chính xác");
                    var newUser = existingUser[0];
                    newUser.RepPwd = newPassword;
                    newUserRepo.Update(newUser);
                }
            }
            return Ok();
        }
    }
}