using NexusCRM.Web.Entities;

namespace NexusCRM.Web.Repositories.Interfaces;

public interface INoteRepository
{
    // ---------------- FILTERS ----------------

    Task<List<Note>> GetByAuthorIdAsync(int authorId);

    Task<List<Note>> GetRecentAsync(int count);

    Task<List<Note>> SearchAsync(string keyword);

    // ---------------- DETAILS ----------------

    Task<Note?> GetWithAuthorAsync(int id);

    Task<List<Note>> GetWithAuthorsAsync();

    // ---------------- BUSINESS / CRM USAGE ----------------

    Task<List<Note>> GetTimelineByUserAsync(int userId);

    Task<List<Note>> GetTimelineByDateRangeAsync(DateTime from, DateTime to);

    // ---------------- VALIDATION ----------------

    Task<bool> ExistsByIdAsync(int id);
}
