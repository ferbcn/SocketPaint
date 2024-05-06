using System.Net.WebSockets;


namespace CoDraw;

public class WebSocketManager : IWebSocketManager
{
    private List<(String, WebSocket)> _sockets = new List<(String, WebSocket)>();

    public void AddSocket(WebSocket webSocket, String uuid)
    {
        _sockets.Add((uuid, webSocket));
    }
    
    public void RemoveSocket(WebSocket webSocket)
    {
        // remove all sockets with the same reference
        _sockets.RemoveAll(s => s.Item2 == webSocket);
    }

    public List<WebSocket> GetAllSockets()
    {
        return _sockets.Select(s => s.Item2).ToList();
    }
    
    public List<WebSocket> GetAllSockets(String uuid)
    {
        return _sockets.Where(s => s.Item1 == uuid).Select(s => s.Item2).ToList();
    }

}