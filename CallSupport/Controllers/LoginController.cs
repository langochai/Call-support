using CallSupport.Common;
using CallSupport.Models;
using CallSupport.Models.DTO;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

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
        public IActionResult Login(string username, string password, bool remember)
        {
            var user = SQLHelper<AuthInfoDTO>.ProcedureToModel("spGetUserData",
                new string[] { "@UserName", "@Password" },
                new object[] { username, password });
            if (user == null || string.IsNullOrEmpty(user.UserName)) return StatusCode(401, "Sai tên đăng nhập hoặc mật khẩu!");
            HttpContext.Session.SetObject<AuthInfoDTO>("User", user);
            string userInfoJSON = JsonConvert.SerializeObject(user);
            string credentials = remember ? EncryptionHelper.Encrypt(userInfoJSON) : "";
            return Ok(credentials);
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
    }
}