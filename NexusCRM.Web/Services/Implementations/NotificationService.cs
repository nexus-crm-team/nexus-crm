using Microsoft.AspNetCore.SignalR;
using NexusCRM.Web.Hubs;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Services.Implementations;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task BroadcastAsync(string title, string message, string type = "info")
    {
        // Send to all connected clients
        await _hubContext.Clients.All.SendAsync("ReceiveNotification", new { title, message, type });
    }
}
