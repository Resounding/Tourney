using System.ComponentModel.DataAnnotations;
namespace Site.Models
{
    public class TourGame
    {
        [Key]
        public int Id { get; set; }
        public Game Game { get; set; }
        public Tour Tour { get; set; }
    }
}