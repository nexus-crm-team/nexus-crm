using Microsoft.AspNetCore.SignalR;
using NexusCRM.Web.Hubs;
using NexusCRM.Web.Services.Interfaces;
using System.Security.Claims;

namespace NexusCRM.Web.Services.Implementations;

public class NotificationService(IHubContext<NotificationHub> hubContext,
    IHttpContextAccessor httpContextAccessor) : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext = hubContext;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    private int? CurrentCompanyId
    {
        get
        {
            var value = _httpContextAccessor.HttpContext?.User.FindFirstValue("companyId");

            return int.TryParse(value, out var companyId) ? companyId : null;
        }
    }

    // Only the caller's own company is notified. Without a companyId claim we
    // send nothing rather than falling back to every connected client.
    public async Task BroadcastAsync(string title, string message, string type = "info")
    {
        var companyId = CurrentCompanyId;
        if (companyId is null)
            return;

        await _hubContext.Clients
            .Group(NotificationHub.CompanyGroup(companyId.Value))
            .SendAsync("ReceiveNotification", new { title, message, type });
    }
}
