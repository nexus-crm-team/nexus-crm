using NexusCRM.Web.Entities;

namespace NexusCRM.Web.Repositories.Interfaces;

public interface IUserRepository
{
    // ---------------- CRM FILTERS ----------------

    Task<List<FollowUp>> GetByDealIdAsync(int dealId);

    Task<List<FollowUp>> GetByUserIdAsync(int userId);

    Task<List<FollowUp>> GetByTaskIdAsync(int taskId);

    Task<List<FollowUp>> GetPendingAsync();

    Task<List<FollowUp>> GetCompletedAsync();

    // ---------------- DETAILS ----------------

    Task<FollowUp?> GetWithDetailsAsync(int id);

    Task<List<FollowUp>> GetWithDealAsync(int dealId);

    Task<List<FollowUp>> GetWithUserAsync(int userId);

    // ---------------- BUSINESS ACTIONS ----------------

    Task MarkAsCompletedAsync(int id);

    Task MarkAsPendingAsync(int id);

    Task CompleteAllForDealAsync(int dealId);

    // ---------------- VALIDATION ----------------

    Task<bool> ExistsByIdAsync(int id);

    // ---------------- DASHBOARD / ANALYTICS ----------------

    Task<int> GetCompletedCountByUserAsync(int userId);

    Task<int> GetPendingCountByUserAsync(int userId);

    Task<int> GetTotalByDealAsync(int dealId);
}
