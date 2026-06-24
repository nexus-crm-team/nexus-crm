using NexusCRM.Web.DTOs.Notes;

namespace NexusCRM.Web.Services.Interfaces;

public interface INoteService
{
    Task<Result<bool>> AddAsync(CreateNoteDto dto);
    Task<Result<bool>> UpdateAsync(int id, UpdateNoteDto? dto);
    Task<Result<bool>> DeleteAsync(int id);

    Task<Result<List<DetailsNoteDto>>> GetAllAsync();
    Task<Result<DetailsNoteDto>> GetByIdAsync(int id);
    Task<Result<DetailsNoteDto>> GetWithAuthorAsync(int id);
    Task<Result<List<DetailsNoteDto>>> GetByAuthorIdAsync(string authorId);
    Task<Result<List<DetailsNoteDto>>> GetRecentAsync(int count);
    Task<List<DetailsNoteDto>> GetWithAuthorsAsync();
    Task<Result<List<DetailsNoteDto>>> GetTimelineByUserAsync(string userId);
    Task<Result<List<DetailsNoteDto>>> GetTimelineByDateRangeAsync(DateTime from, DateTime to);

    Task<Result<bool>> ExistsByIdAsync(int id); 
    Task<Result<List<DetailsNoteDto>>> SearchAsync(string? keyword);

    // TODO: Adding pagination
    // Task<List<T>> GetPagedAsync(int page, int pageSize);
}