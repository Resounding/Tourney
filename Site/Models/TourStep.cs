using System.ComponentModel.DataAnnotations;
using System;
namespace Site.Models
{
    public class TourStep
    {
        [Key]
        public int Id { get; set; }
        public Tour Tour { get; set; }
        public int Step { get; set; }
        public DateTime TimeStamp { get; set; }
    }
}