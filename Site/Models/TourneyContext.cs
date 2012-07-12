using System.Data.Entity;

namespace Site.Models
{
    public class TourneyContext : DbContext
    {
        public DbSet<Tour> Tours { get; set; }
    }
}
