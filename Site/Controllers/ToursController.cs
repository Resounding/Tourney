using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Site.Models;
using System.Web.Routing;

namespace Site.Controllers
{
    public class ToursController : Controller
    {
        private TourneyContext db = new TourneyContext();
        [HttpGet]
        public ActionResult Index(int? tourId)
        {
            Tour tour = null;
            if (tourId.HasValue) {
                tour = (db.Tours.FirstOrDefault(t => t.Id == tourId.Value));
            }

            if (tour == null) {
                var ip = Request.ServerVariables["REMOTE_ADDR"] ?? "";
                tour = new Tour(ip);

                db.Tours.Add(tour);

                var game = new Game("Team 1", "Team 2", "Gym A", "8:00");
                db.Games.Add(game);
                var tourGame = new TourGame {
                    Game = game,
                    Tour = tour
                };
                db.TourGames.Add(tourGame);

                db.SaveChanges();

                // create games for the tour

                return new RedirectToRouteResult(new RouteValueDictionary { { "controller", "Tours" }, { "tourId", tour.Id } });
            }

            var inputModel = new TourInputModel {
                TourId = tour.Id
            };

            return View(inputModel);
        }

        public ActionResult Mobile(int tourId)
        {
            var game = (from tg in db.TourGames where tg.Tour.Id == tourId select tg.Game).FirstOrDefault();

            var model = new MobileTourOutputModel {
                TourId = tourId,
                GameId = game.id,
                HomeTeam = game.home.team,
                VisitingTeam = game.visitor.team,
                HomeScore = game.home.score,
                VisitorScore = game.visitor.score
            };
            return View(model);
        }

        [HttpPost]
        public ActionResult Log(FormCollection collection)
        {
            int tourId;
            int step;

            if (int.TryParse(collection["tourId"], out tourId)) {
                if (int.TryParse(collection["step"], out step)) {
                    var tour = db.Tours.FirstOrDefault(t => t.Id == tourId);
                    var now = DateTime.Now;
                    var tourStep = new TourStep {
                        Tour = tour,
                        Step = step,
                        TimeStamp = now
                    };
                    db.TourSteps.Add(tourStep);
                    db.SaveChanges();
                }
            }
            return new EmptyResult();
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}