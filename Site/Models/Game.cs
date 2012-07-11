using System;
using System.Collections.Generic;

namespace Site.Models
{
    public class Side
    {
        public string team { get; set; }
        public int score { get; set; }
    }

    public class Game
    {
        public int id { get; set; }
        public string status { get; set; }
        public string location { get; set; }
        public string time { get; set; }
        public Side home { get; set; }
        public Side visitor { get; set; }
        public string scorer { get; set; }
    }
}