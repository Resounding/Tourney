using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Site.Models
{
    public class Tour
    {
        public Tour()
        {
            Date = DateTime.Now;
        }

        public Tour(string ip)
            : this()
        {
            Ip = ip;
        }

        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Ip { get; set; }
    }
}