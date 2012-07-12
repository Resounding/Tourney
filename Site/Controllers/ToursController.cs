using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Site.Models;

namespace Site.Controllers
{
    public class ToursController : Controller
    {
        private TourneyContext db = new TourneyContext();

        public ActionResult Index()
        {            
            var ip = Request.ServerVariables["REMOTE_ADDR"] ?? "";
            var tour = new Tour(ip);
            db.Tours.Add(tour);
            db.SaveChanges();

            var inputModel = new TourInputModel {
                TourId = tour.Id
            };

            return View(inputModel);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}