using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using CallSupport.Models;

namespace CallSupport.Models.Context
{
    public partial class CallASSYDBContext : DbContext
    {
        public CallASSYDBContext()
        {
        }

        public CallASSYDBContext(DbContextOptions<CallASSYDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<CallerMst> CallerMst { get; set; }
        public virtual DbSet<RepMst> RepMst { get; set; }
        public virtual DbSet<UserMst> UserMst { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                optionsBuilder.UseSqlServer(Startup.ConnectionString);
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<CallerMst>(entity =>
            {
                entity.HasKey(e => e.CallerC);

                entity.ToTable("Caller_mst");

                entity.Property(e => e.CallerC)
                    .HasColumnName("caller_c")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.CallerNm)
                    .HasColumnName("caller_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.CallerPwd)
                    .HasColumnName("caller_pwd")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.DepC)
                    .HasColumnName("Dep_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.UpDt)
                    .HasColumnName("up_dt")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID")
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<RepMst>(entity =>
            {
                entity.HasKey(e => e.RepPwd);

                entity.ToTable("Rep_mst");

                entity.Property(e => e.RepPwd)
                    .HasColumnName("Rep_pwd")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.DepC)
                    .HasColumnName("Dep_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.RepC)
                    .IsRequired()
                    .HasColumnName("Rep_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.RepNm)
                    .HasColumnName("Rep_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.UpDt)
                    .HasColumnName("up_dt")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID")
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<UserMst>(entity =>
            {
                entity.HasKey(e => e.UserName);

                entity.ToTable("user_mst");

                entity.Property(e => e.UserName)
                    .HasColumnName("userName")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.AddPermision).HasColumnName("addPermision");

                entity.Property(e => e.Basedefect).HasColumnName("basedefect");

                entity.Property(e => e.Call).HasColumnName("call");

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.CreateTime)
                    .HasColumnName("createTime")
                    .HasColumnType("datetime");

                entity.Property(e => e.DefectDetail)
                    .HasColumnName("defectDetail")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.DefectGroup)
                    .HasColumnName("defectGroup")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.DeletePermision).HasColumnName("deletePermision");

                entity.Property(e => e.Depart).HasColumnName("depart");

                entity.Property(e => e.EditPermision).HasColumnName("editPermision");

                entity.Property(e => e.FullName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.GroupMode)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Line).HasColumnName("line");

                entity.Property(e => e.Password)
                    .IsRequired()
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Permiss).HasColumnName("permiss");

                entity.Property(e => e.Position).HasColumnName("position");

                entity.Property(e => e.Repair).HasColumnName("repair");

                entity.Property(e => e.UserCreate)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.UserId)
                    .IsRequired()
                    .HasColumnName("UserID")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Workproc).HasColumnName("workproc");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
