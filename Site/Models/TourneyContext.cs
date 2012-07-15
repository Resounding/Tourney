using System.Data.Entity;

namespace Site.Models
{
    public class TourneyContext : DbContext
    {
        public DbSet<Tour> Tours { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<TourGame> TourGames { get; set; }
        public DbSet<TourStep> TourSteps { get; set; }
    }
}
