using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Xml.Linq;
using CallSupport.Hubs;

namespace CallSupport
{
    public class Startup
    {
        public IConfiguration Configuration { get; }
        public static string ConnectionString { get; private set; }
        private const int MaxRetries = 3;
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
            ConnectionString = GetConnectionStringWithFallback("FallbackConnection");
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews().AddRazorRuntimeCompilation(); ;
            services.AddSignalR();

            //Session
            services.AddSession(cfg =>
            {
                cfg.IdleTimeout = TimeSpan.FromHours(8);
                cfg.Cookie.Name = ".Linecode-support.Session"; // <--- Add line
                cfg.Cookie.HttpOnly = true;
                cfg.Cookie.IsEssential = true;
            });

            //Config CORS
            services.AddCors(o => o.AddPolicy("LinecodeSupport", builder =>
            {
                builder.AllowAnyOrigin()
                       .AllowAnyMethod()
                       .AllowAnyHeader();
            }));

            services.Configure<RequestLocalizationOptions>(options =>
            {
                options.SupportedCultures = new List<CultureInfo> { new CultureInfo("vi-VN") };
            });
            //ConfigureDatabase(services);
        }
        private string GetConnectionStringWithFallback(string fallbackKey)
        {
            string connectionString = null;
            int attempts = 0;

            while (attempts < MaxRetries)
            {
                try
                {
                    connectionString = ReadConnectionStringFromExternalFile("websettings.json", "DefaultConnection");
                    if (TestDatabaseConnection(connectionString))
                    {
                        return connectionString;
                    }
                    else
                    {
                        throw new Exception($"Kết nối tới '{connectionString}' thất bại");
                    }
                }
                catch (Exception ex)
                {
                    string logFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "log.txt");
                    string logMessage = $"[{DateTime.Now}] Error: {ex.Message}\n{ex.StackTrace}\n\n";

                    File.AppendAllText(logFilePath, logMessage);
                }

                attempts++;
            }

            // Fallback to appsettings.json
            connectionString = Configuration.GetConnectionString(fallbackKey);
            return connectionString;
        }

        private string ReadConnectionStringFromExternalFile(string filePath, string key)
        {
            if (File.Exists(filePath))
            {
                var json = File.ReadAllText(filePath);
                var config = JObject.Parse(json);
                var connectionString = config["ConnectionStrings"]?[key]?.ToString();
                if (!string.IsNullOrEmpty(connectionString))
                {
                    return connectionString;
                }
            }

            throw new Exception("Failed to read connection string from external file.");
        }

        private bool TestDatabaseConnection(string connectionString)
        {
            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    connection.Open();
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseSession();
            app.UseCors("LinecodeSupport");
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();

            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapControllerRoute(
                   name: "default",
                   pattern: "{controller=Home}/{action=Index}/");
                endpoints.MapHub<NotificationHub>("/notificationHub");
            });
            app.UseStatusCodePagesWithRedirects("/Home/Error");
        }
    }
}
