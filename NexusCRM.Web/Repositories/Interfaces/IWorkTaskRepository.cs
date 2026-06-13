using NexusCRM.Web.Entities;

namespace NexusCRM.Web.Repositories.Interfaces;

public interface IWorkTaskRepository
{


    // ---------------- FILTERS ----------------

    Task<List<WorkTask>> GetByUserIdAsync(int userId);

    Task<List<WorkTask>> GetByDealIdAsync(int dealId);

    Task<List<WorkTask>> GetCompletedAsync();

    Task<List<WorkTask>> GetPendingAsync();

    Task<List<WorkTask>> GetOverdueAsync();

    // ---------------- DETAILS ----------------

    Task<WorkTask?> GetWithDetailsAsync(int id);

    Task<List<WorkTask>> GetWithUserAsync(int userId);

    Task<List<WorkTask>> GetWithDealAsync(int dealId);

    // ---------------- BUSINESS ACTIONS ----------------

    Task MarkAsCompletedAsync(int id);

    Task MarkAsPendingAsync(int id);

    Task AssignToUserAsync(int taskId, int userId);

    Task ChangeDeadlineAsync(int taskId, DateTime deadline);

    // ---------------- VALIDATION ----------------

    Task<bool> ExistsByIdAsync(int id);

    // ---------------- DASHBOARD / ANALYTICS ----------------

    Task<int> GetCompletedCountByUserAsync(int userId);

    Task<int> GetPendingCountByUserAsync(int userId);

    Task<int> GetOverdueCountByUserAsync(int userId);
}
