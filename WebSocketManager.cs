using System.Net.WebSockets;

namespace WebApiReact;

public class WebSocketManager : IWebSocketManager
{
    private List<WebSocket> _sockets = new List<WebSocket>();

    public void AddSocket(WebSocket webSocket)
    {
        _sockets.Add(webSocket);
    }

    public void RemoveSocket(WebSocket webSocket)
    {
        _sockets.Remove(webSocket);
    }

    public List<WebSocket> GetAllSockets()
    {
        return _sockets;
    }
}