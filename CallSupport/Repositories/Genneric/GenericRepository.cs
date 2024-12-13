using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using EFCore.BulkExtensions;
using CallSupport.Models.Context;

namespace CallSupport.Repositories
{
    public class GenericRepository<T> where T : class
    {
        protected CallASSYDBContext db { get; set; }
        protected DbSet<T> table = null;

        public GenericRepository()
        {
            db = new CallASSYDBContext();
            table = db.Set<T>();
        }

        public GenericRepository(CallASSYDBContext db)
        {
            this.db = db;
            table = db.Set<T>();
        }

        public List<T> GetAll()
        {
            return table.ToList();
        }

        public T GetByID(int id)
        {
            return table.Find(id);
        }
        /// <summary>
        /// Insert an item
        /// </summary>
        /// <param name="item">Item to be inserted</param>
        /// <returns>ID of inserted item if exists. Otherwise return -1</returns>
        public int Create(T item)
        {
            table.Add(item);
            db.SaveChanges();
            var idProperty = item.GetType().GetProperty("Id");
            if (idProperty != null)
            {
                return Convert.ToInt32(idProperty.GetValue(item));
            }
            return -1;
        }
        /// <summary>
        /// Update an item
        /// </summary>
        /// <param name="item">Item to be updated</param>
        /// <returns>ID of updated item if exists. Otherwise return -1</returns>
        public int Update(T item)
        {
            table.Attach(item);
            db.Entry(item).State = EntityState.Modified;
            db.SaveChanges();
            var idProperty = item.GetType().GetProperty("Id");
            if (idProperty != null)
            {
                return Convert.ToInt32(idProperty.GetValue(item));
            }
            return -1;
        }

        public void Delete(int id)
        {
            table.Remove(table.Find(id));
            db.SaveChanges();
        }

        public void Delete(List<T> item)
        {
            table.RemoveRange(item);
            db.SaveChanges();
        }

        public int Confirm(T[] item)
        {
            for (int i = 0; i < item.Length; i++)
            {
                table.Attach(item[i]);
                db.Entry(item[i]).State = EntityState.Modified;
            }
            return db.SaveChanges();
        }

        public async Task<int> CreateAsync(T item)
        {
            table.Add(item);
            return await db.SaveChangesAsync();
        }

        public async Task<int> UpdateAsync(T item)
        {
            table.Attach(item);
            db.Entry(item).State = EntityState.Modified;
            return await db.SaveChangesAsync();
        }

        public async Task<int> DeleteAsync(int id)
        {
            table.Remove(table.Find(id));
            return await db.SaveChangesAsync();
        }

        public int RemoveRange(IEnumerable<T> items)
        {
            table.RemoveRange(items);
            return db.SaveChanges();
        }

        public int CreateRange(List<T> items)
        {
            table.AddRange(items);
            return db.SaveChanges();
        }
        /// <summary>
        /// Find a specific record
        /// </summary>
        /// <param name="predicate">A lambda function to filter the records, must return a boolean value</param>
        /// <returns>A list of filtered records</returns>
        public List<T> Find(Expression<Func<T, bool>> predicate)
        {
            return table.Where(predicate).ToList();
        }
        /// <summary>
        /// Find a specific record
        /// </summary>
        /// <param name="predicate">A lambda function to filter the records, must return a boolean value</param>
        /// <param name="offset">Number of offset</param>
        /// <param name="limit">Number of limit</param>
        /// <param name="limit">A lambda function to order the records, must return a boolean value</param>
        /// <returns>A list of filtered records</returns>
        public List<T> Find(Expression<Func<T, bool>> predicate, int offset = 0, int limit = 0, Expression<Func<T, int?>> orderBy = null)
        {
            var query = table.Where(predicate);
            if(orderBy != null) query = query.OrderBy(orderBy);
            if (offset > 0) query = query.Skip(offset);
            if (limit > 0) query = query.Take(limit);
            return query.ToList();
        }


        /// <summary>
        /// Bulk insert multiple records
        /// </summary>
        /// <param name="items">Records that need to be saved</param>
        /// <param name="currentSession">Information of current user (Optional)</param>
        public void BulkInsert(List<T> items, ISession currentSession = null)
        {
            var username = currentSession?.GetString("username");
            items = items.Select(item =>
            {
                var type = item.GetType();
                var createdBy = type.GetProperty("CreatedBy");
                var createdDate = type.GetProperty("CreatedDate");
                createdBy?.SetValue(item, username); // might need to use DbNull.Value instead
                createdDate?.SetValue(item, DateTime.Now);
                return item;
            }).ToList();

            db.BulkInsert(items);
        }
        /// <summary>
        /// Bulk insert multiple records
        /// </summary>
        /// <param name="items">Records that need to be updated</param>
        /// <param name="currentSession">Information of current user (Optional)</param>
        public void BulkUpdate(List<T> items, ISession currentSession = null)
        {
            var username = currentSession?.GetString("username");
            items = items.Select(item =>
            {
                var type = item.GetType();
                var updateBy = type.GetProperty("UpdatedBy");
                var updateDate = type.GetProperty("UpdatedDate");
                updateBy?.SetValue(item, username); // might need to use DbNull.Value instead
                updateDate?.SetValue(item, DateTime.Now);
                return item;
            }).ToList();
            db.BulkUpdate(items);
        }
    }
}
