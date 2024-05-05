using Microsoft.AspNetCore.Mvc;

namespace WebApiReact;

public class WebApiController : Controller
{
    // Always seed your Random()
    private static readonly Random Random = new Random();
 
    [HttpGet("/api/helloworld")]
    public string GetHelloWorld()
    {
        var message = "Hello World!";
        return message;
    }    
    
    [HttpGet("/api/getuuid")]
    public IActionResult GetRandomCount()
    {
        Guid uuid = Guid.NewGuid();
        string uuidString = uuid.ToString();
        var resp = new { uuid = uuid };
        Console.WriteLine("/api/getuuid: " + uuid);
        return new JsonResult(resp);
    }
    
    // // Redirect to React development server
    // [HttpGet("/")]
    // public IActionResult GetIndex()
    // {
    //     return Redirect("http://localhost:3000");
    // }

}
