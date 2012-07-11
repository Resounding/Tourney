using System.Threading.Tasks;
using SignalR;
using Site.Models;
using Newtonsoft.Json;

public class TourneyConnection : PersistentConnection
{
    protected override Task OnReceivedAsync(IRequest request, string connectionId, string data)
    {
        GameAction action = JsonConvert.DeserializeObject<GameAction>(data);
        var game = GamesList.Instance[action.gameId];

        switch (action.action) {
            case "startScoring":                
                game.scorer = connectionId;
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

        // Broadcast data to all clients
        return Connection.Broadcast(game);
    }
}