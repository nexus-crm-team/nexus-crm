using System.Threading.Tasks;

namespace NexusCRM.Web.Services.Interfaces;

public interface INotificationService
{
    Task BroadcastAsync(string title, string message, string type = "info");
}
