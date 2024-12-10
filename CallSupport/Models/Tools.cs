using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class Tools
    {
        public int Id { get; set; }
        public string ToolC { get; set; }
        public string ToolNm { get; set; }
        public string Img { get; set; }
        public string UserIdCreated { get; set; }
        public DateTime? CreatedDate { get; set; }
    }
}
