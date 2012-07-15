namespace Site.Models
{
    public class MobileTourOutputModel
    {
        public int TourId { get; set; }
        public int GameId { get; set; }
        public string HomeTeam { get; set; }
        public string VisitingTeam { get; set; }
        public int HomeScore { get; set; }
        public int VisitorScore { get; set; }
    }
}