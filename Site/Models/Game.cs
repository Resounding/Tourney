using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Site.Models
{
    public class Side
    {
        public string team { get; set; }
        public int score { get; set; }
    }

    public class Game
    {
        public Game()
        {
            status = "notStarted";
        }

        public Game(string homeTeam, string visitingTeam, string location, string time)
            : this()
        {
            home = new Side {
                team = homeTeam,
                score = 0
            };
            visitor = new Side {
                team = visitingTeam,
                score = 0
            };
            this.location = location;
            this.time = time;
        }

        [Key]
        public int id { get; set; }
        public string status { get; set; }
        public string location { get; set; }
        public string time { get; set; }
        public Side home { get; set; }
        public Side visitor { get; set; }
        public string scorer { get; set; }
    }
}