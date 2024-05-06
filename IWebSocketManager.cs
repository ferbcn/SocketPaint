using System.Net.WebSockets;

namespace CoDraw;

public interface IWebSocketManager
{
    void AddSocket(WebSocket webSocket, String uuid);
    void RemoveSocket(WebSocket webSocket);
    List<WebSocket> GetAllSockets();
    List<WebSocket> GetAllSockets(String uuid);
}