using NexusCRM.Web.Entities;

namespace NexusCRM.Web.Repositories.Interfaces;

public interface INotificationRepository : IRepository<Notification>
{
    Task<List<Notification>> GetByUserIdAsync(string userId);
    Task<List<Notification>> GetUnreadByUserIdAsync(string userId);
    Task<int> GetUnreadCountAsync(string userId);
    Task MarkAsReadAsync(int id);
    Task MarkAllAsReadAsync(string userId);
}
