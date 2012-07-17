using System.Linq;
using System.Threading.Tasks;
using SignalR;
using Site.Models;
using Newtonsoft.Json;

public class TourConnection : PersistentConnection
{
    private TourneyContext _db = new TourneyContext();

    protected override Task OnReceivedAsync(IRequest request, string connectionId, string data)
    {
        GameAction action = JsonConvert.DeserializeObject<GameAction>(data);
        var game = (from g in _db.Games where g.id == action.gameId select g).FirstOrDefault();

        switch (action.action) {
            case "startScoring":                
                game.scorer = connectionId;
                game.status = "inProgress";
                break;
            case "gameOn":
                game.status = "inProgress";
                break;
            case "homeScore":
                game.status = "inProgress";
                game.home.score++;
                break;
            case "visitorScore":
                game.status = "inProgress";
                game.visitor.score++;
                break;
            case "gameOver":
                game.status = "done";
                game.scorer = null;
                break;
        }

        _db.SaveChanges();

        // Broadcast data to all clients
        return Connection.Broadcast(game);
    }
}