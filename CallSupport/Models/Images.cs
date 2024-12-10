using System;
using System.Collections.Generic;

namespace CallSupport.Models
{
    public partial class Images
    {
        public long Id { get; set; }
        public string ImgAddress { get; set; }
        public string UserIdCreated { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool? IsFromCaller { get; set; }
    }
}
