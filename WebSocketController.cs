using System.Text;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;

namespace WebApiReact;

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
        if (HttpContext.WebSockets.IsWebSocketRequest)
        {
            using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
            _webSocketManager.AddSocket(webSocket); // Add the new WebSocket to the list.
            Console.WriteLine("WebSocket connection established, current connections: " + _webSocketManager.GetAllSockets().Count);
            await Echo(webSocket);
            _webSocketManager.RemoveSocket(webSocket); // Remove the WebSocket when it's done
        }
        else
        {
            HttpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        }
    }
    
    public async Task Echo(WebSocket webSocket)
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
                break;
            }
            
            foreach (var socket in _webSocketManager.GetAllSockets())
            {
                if (socket.State == WebSocketState.Open)
                {
                    await socket.SendAsync(
                        new ArraySegment<byte>(sendBuffer, 0, sendBuffer.Length),
                        receiveResult.MessageType,
                        receiveResult.EndOfMessage,
                        CancellationToken.None);
                }
                else
                {
                    _webSocketManager.RemoveSocket(socket); // Remove the WebSocket when it's done
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
