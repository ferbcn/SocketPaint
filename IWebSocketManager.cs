using System.Net.WebSockets;

namespace WebApiReact;

public interface IWebSocketManager
{
    void AddSocket(WebSocket webSocket);
    void RemoveSocket(WebSocket webSocket);
    List<WebSocket> GetAllSockets();
}