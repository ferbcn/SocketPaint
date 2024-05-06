using System.Text;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;

namespace CoDraw;

public class WebSocketController : Controller
{
    private readonly IWebSocketManager _webSocketManager;
    
    public WebSocketController(IWebSocketManager webSocketManager)
    {
        _webSocketManager = webSocketManager;
    }
    
    [HttpGet("/wschat")]
    public async Task Get()
    {
        // read uuid from url
        var uuidString = HttpContext.Request.Query["uuid"];
        Console.WriteLine("Opening websocket for UUID: " + uuidString);

        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            _webSocketManager.AddSocket(webSocket, uuidString); // Add the new WebSocket to the list.
            Console.WriteLine("WebSocket connection established, current connections: " + _webSocketManager.GetAllSockets().Count);
            await Echo(webSocket, uuidString);
            _webSocketManager.RemoveSocket(webSocket); // Remove the WebSocket when it's done
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
    
    public async Task Echo(WebSocket webSocket, String uuid)
    {
        var buffer = new byte[128];
        WebSocketReceiveResult receiveResult;
        
        do
        {
            receiveResult = await webSocket.ReceiveAsync(
                new ArraySegment<byte>(buffer), CancellationToken.None);
            
            var receivedString = Encoding.UTF8.GetString(buffer, 0, receiveResult.Count);
            Console.WriteLine($"Received: {receivedString}");
            var sendBuffer = Encoding.UTF8.GetBytes(receivedString);
            
            if (receiveResult.MessageType == WebSocketMessageType.Close)
            {
                Console.WriteLine("Received close message");
                continue;
            }
            
            foreach (var socket in _webSocketManager.GetAllSockets(uuid))
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(
                        new ArraySegment<byte>(sendBuffer, 0, sendBuffer.Length),
                        receiveResult.MessageType,
                        receiveResult.EndOfMessage,
                        CancellationToken.None);
                }
            }
        } 
        while (!receiveResult.CloseStatus.HasValue);
        
        Console.WriteLine("Connection closed");
        await webSocket.CloseAsync(
            receiveResult.CloseStatus.Value,
            receiveResult.CloseStatusDescription,
            CancellationToken.None);
    }
}
