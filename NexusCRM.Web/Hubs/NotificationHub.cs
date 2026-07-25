using Microsoft.AspNetCore.SignalR;

namespace NexusCRM.Web.Hubs;

public class NotificationHub : Hub
{
    // Clients can call this method to send a notification (optional)
    public async Task SendNotification(string title, string message, string type = "info")
    {
        await Clients.All.SendAsync("ReceiveNotification", new { title, message, type });
    }
}
