using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using Site.Models;

namespace Site.Controllers
{
    public class TourGamesController : ApiController
    {
        private TourneyContext _db = new TourneyContext();

        // GET /api/games
        public Game[] Get(int tourId)
        {
            var games = (from tg in _db.TourGames where tg.Tour.Id == tourId select tg.Game).ToArray();
            return games;
        }

        // POST /api/games
        public void Post(string value)
        {
            GamesList.Reset();
        }
    }
}
