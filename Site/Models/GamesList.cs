using System.Collections.Generic;
using Site.Models;

public class GamesList : Dictionary<int, Game>
{
    private readonly static GamesList _instance = new GamesList();

    public static GamesList Instance
    {
        get { return _instance; }
    }

    private GamesList()
    {
        Add(1, new Game {
            id = 1,
            status = "notStarted",
            location = "Gym A",
            time = "8:00 AM",
            home = new Side {
                team = "Team #1",
                score = 0
            },
            visitor = new Side {
                team = "Team #2",
                score = 0
            }
        });
    }
}