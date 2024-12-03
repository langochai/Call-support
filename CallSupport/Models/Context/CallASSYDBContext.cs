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
        public virtual DbSet<DepMst> DepMst { get; set; }
        public virtual DbSet<LineMst> LineMst { get; set; }
        public virtual DbSet<PosMst> PosMst { get; set; }
        public virtual DbSet<QadefectMst> QadefectMst { get; set; }
        public virtual DbSet<RepMst> RepMst { get; set; }
        public virtual DbSet<SecMst> SecMst { get; set; }
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

            modelBuilder.Entity<DepMst>(entity =>
            {
                entity.HasKey(e => e.DepC);

                entity.ToTable("Dep_mst");

                entity.Property(e => e.DepC)
                    .HasColumnName("Dep_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.DepMusic)
                    .HasColumnName("Dep_music")
                    .HasMaxLength(250)
                    .IsUnicode(false);

                entity.Property(e => e.DepNm)
                    .HasColumnName("Dep_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.Sort)
                    .HasColumnName("sort")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.UpDt)
                    .HasColumnName("up_dt")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID")
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<LineMst>(entity =>
            {
                entity.HasKey(e => e.LineC);

                entity.ToTable("Line_mst");

                entity.Property(e => e.LineC)
                    .HasColumnName("Line_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.LineMusic)
                    .HasColumnName("Line_music")
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.LineNm)
                    .HasColumnName("Line_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.Sort)
                    .HasColumnName("sort")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.UpDt)
                    .HasColumnName("up_dt")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID")
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<PosMst>(entity =>
            {
                entity.HasKey(e => e.PosC)
                    .HasName("PK_Pos_nm");

                entity.ToTable("Pos_mst");

                entity.Property(e => e.PosC)
                    .HasColumnName("Pos_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.PosMusic)
                    .HasColumnName("Pos_music")
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.PosNm)
                    .HasColumnName("Pos_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.Sort)
                    .HasColumnName("sort")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.UpDt)
                    .HasColumnName("up_dt")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID")
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<QadefectMst>(entity =>
            {
                entity.HasKey(e => new { e.Maloi, e.DepC })
                    .HasName("PK_QAError_mst");

                entity.ToTable("QADefect_mst");

                entity.Property(e => e.Maloi)
                    .HasColumnName("maloi")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.DepC)
                    .HasColumnName("Dep_c")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.SecC)
                    .HasColumnName("sec_c")
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.Sort)
                    .HasColumnName("sort")
                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.Tenloi)
                    .HasColumnName("tenloi")
                    .HasMaxLength(50);

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
                entity.HasKey(e => e.RepC);

                entity.ToTable("Rep_mst");

                entity.Property(e => e.RepC)
                    .HasColumnName("Rep_c")
                    .HasMaxLength(5)
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

                entity.Property(e => e.RepNm)
                    .HasColumnName("Rep_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.RepPwd)
                    .IsRequired()
                    .HasColumnName("Rep_pwd")
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.UpDt)
                    .HasColumnName("up_dt")
                    .HasColumnType("datetime");

                entity.Property(e => e.UserId)
                    .HasColumnName("UserID")
                    .HasMaxLength(25)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<SecMst>(entity =>
            {
                entity.HasNoKey();

                entity.ToTable("Sec_mst");

                entity.Property(e => e.ComputerName)
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.Ipaddress)
                    .HasColumnName("IPaddress")
                    .HasMaxLength(25)
                    .IsUnicode(false);

                entity.Property(e => e.SecC)
                    .HasColumnName("Sec_c")
                    .HasMaxLength(5)
                    .IsUnicode(false);

                entity.Property(e => e.SecMusic)
                    .HasColumnName("Sec_music")
                    .HasMaxLength(500)
                    .IsUnicode(false);

                entity.Property(e => e.SecNm)
                    .HasColumnName("Sec_nm")
                    .HasMaxLength(50);

                entity.Property(e => e.Sort)
                    .HasColumnName("sort")
                    .HasDefaultValueSql("((0))");

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
