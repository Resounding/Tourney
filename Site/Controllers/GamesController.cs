﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web.Http;
using Site.Models;

namespace Site.Controllers
{
    public class GamesController : ApiController
    {
        // GET /api/games
        public GamesList Get()
        {
            return GamesList.Instance;
        }

        // GET /api/games/5
        public Game Get(int id)
        {
            return GamesList.Instance[id];
        }

        // POST /api/games
        public void Post(string value)
        {
            GamesList.Reset();
        }
    }
}
