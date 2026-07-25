using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace NexusCRM.Web.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    public static string CompanyGroup(int companyId) => $"company-{companyId}";

    // Each connection only ever joins its own company's group, so a broadcast
    // can never reach another tenant.
    public override async Task OnConnectedAsync()
    {
        var value = Context.User?.FindFirstValue("companyId");
        if (int.TryParse(value, out var companyId))
            await Groups.AddToGroupAsync(Context.ConnectionId, CompanyGroup(companyId));

        await base.OnConnectedAsync();
    }
}
