using NexusCRM.Web.DTOs.Tasks;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;
using NexusCRM.Web.Services.Interfaces;
using System.Security.Claims;

namespace NexusCRM.Web.Services.Implementations;

public class WorkTaskService(IWorkTaskRepository workTaskRepository,
    IUserRepository userRepository,
    IDealRepository dealRepository,
    IHttpContextAccessor httpContextAccessor) : IWorkTaskService
{
    private readonly IWorkTaskRepository _repository = workTaskRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IDealRepository _dealRepository = dealRepository;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    private string? CurrentUserId
        => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public async Task<Result<bool>> AddAsync(CreateTaskDto dto)
    {
        if (dto is null ||
            string.IsNullOrWhiteSpace(dto.Title) || dto.Title.Length > 30 ||
            string.IsNullOrWhiteSpace(dto.Description) ||
            dto.Deadline == DateTime.MinValue ||
            dto.DealId < 1)
                return Result<bool>.Fail("Invalid Input Data");

        var userId = CurrentUserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Result<bool>.Fail("Invalid User Data");

        var deal = await _dealRepository.GetByIdAsync(dto.DealId);
        if (deal is null)
            return Result<bool>.Fail("Deal Not Found");

        var entity = new WorkTask
        {
            Title = dto.Title,
            Description = dto.Description,
            Deadline = dto.Deadline,
            DealId = dto.DealId,
            UserId = userId,
        };

        await _repository.AddAsync(entity);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> AssignToUserAsync(int taskId, string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<bool>.Fail("Invalid User Id");

        var task = await _repository.GetByIdAsync(taskId);
        if (task is null)
            return Result<bool>.Fail("Task Not Found");

        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
            return Result<bool>.Fail("User Not Found");

        task.UserId = userId;
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> ChangeDeadlineAsync(int taskId, DateTime deadline)
    {
        if (deadline == DateTime.MinValue)
            return Result<bool>.Fail("Invalid Input Data");

        var task = await _repository.GetByIdAsync(taskId);
        if (task is null)
            return Result<bool>.Fail("Task Not Found");

        task.Deadline = deadline;
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> DeleteAsync(int id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task is null)
            return Result<bool>.Fail("Task Not Found");

        await _repository.Delete(task);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<bool> ExistsByIdAsync(int id)
        => await _repository.ExistsByIdAsync(id);

    public async Task<Result<List<DetailsTaskDto>>> GetAllAsync()
    {
        var tasks = await _repository.GetAllAsync();
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<List<DetailsTaskDto>>> GetByDealIdAsync(int dealId)
    {
        var tasks = await _repository.GetByDealIdAsync(dealId);
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<DetailsTaskDto>> GetByIdAsync(int id)
    {
        var task = await _repository.GetByIdAsync(id);

        return task is null
            ? Result<DetailsTaskDto>.Fail("Task Not Found")
            : Result<DetailsTaskDto>.Success(MapToDetailsDto(task));
    }

    public async Task<Result<List<DetailsTaskDto>>> GetByUserIdAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<List<DetailsTaskDto>>.Fail("Invalid User Data");

        var tasks = await _repository.GetByUserIdAsync(userId);
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<List<DetailsTaskDto>>> GetCompletedAsync()
    {
        var tasks = await _repository.GetCompletedAsync();
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<int>> GetCompletedCountByUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<int>.Fail("Invalid User Data");

        var tasksCount = await _repository.GetCompletedCountByUserAsync(userId);

        return Result<int>.Success(tasksCount);
    }

    public async Task<Result<List<DetailsTaskDto>>> GetOverdueAsync()
    {
        var tasks = await _repository.GetOverdueAsync();
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<int>> GetOverdueCountByUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<int>.Fail("Invalid User Data");

        var tasksCount = await _repository.GetOverdueCountByUserAsync(userId);

        return Result<int>.Success(tasksCount);
    }

    public async Task<Result<List<DetailsTaskDto>>> GetPendingAsync()
    {
        var tasks = await _repository.GetPendingAsync();
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<int>> GetPendingCountByUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<int>.Fail("Invalid User Data");

        var tasksCount = await _repository.GetPendingCountByUserAsync(userId);

        return Result<int>.Success(tasksCount);
    }

    public async Task<Result<List<DetailsTaskDto>>> GetWithDealAsync(int dealId)
    {
        var tasks = await _repository.GetWithDealAsync(dealId);
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<DetailsTaskDto>> GetWithDetailsAsync(int id)
    {
        var task = await _repository.GetWithDetailsAsync(id);

        return task is null
            ? Result<DetailsTaskDto>.Fail("Task Not Found")
            : Result<DetailsTaskDto>.Success(MapToDetailsDto(task));
    }

    public async Task<Result<List<DetailsTaskDto>>> GetWithUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<List<DetailsTaskDto>>.Fail("Invalid User Data");

        var tasks = await _repository.GetWithUserAsync(userId);
        var taskDtos = MapToDetailsDto(tasks);

        return Result<List<DetailsTaskDto>>.Success(taskDtos);
    }

    public async Task<Result<bool>> MarkAsCompletedAsync(int id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task is null)
            return Result<bool>.Fail("Task Not Found");

        task.IsCompleted = true;
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> MarkAsPendingAsync(int id)
    {
        var task = await _repository.GetByIdAsync(id);
        if (task is null)
            return Result<bool>.Fail("Task Not Found");

        task.IsCompleted = false;
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> UpdateAsync(int id, UpdateTaskDto dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.Description) || dto.DealId < 1)
            return Result<bool>.Fail("Invalid Input Data");

        var task = await _repository.GetByIdAsync(id);
        if (task is null)
            return Result<bool>.Fail("Task Not Found");

        var deal = await _dealRepository.GetByIdAsync(dto.DealId);
        if (deal is null)
            return Result<bool>.Fail("Deal Not Found");

        task.Description = dto.Description;
        task.IsCompleted = dto.IsCompleted;
        task.DealId = dto.DealId;

        _repository.Update(task);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public List<DetailsTaskDto> MapToDetailsDto(List<WorkTask>? taskEntities)
    {
        if (taskEntities is null)
            return [];

        List<DetailsTaskDto> taskDtos = new(taskEntities.Count);
        foreach (var task in taskEntities)
        {
            var taskDto = new DetailsTaskDto()
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                IsCompleted = task.IsCompleted,
                Deadline = task.Deadline,
                DealId = task.DealId,
                UserId = task.UserId,
            };
            taskDtos.Add(taskDto);
        }
        return taskDtos;
    }
    public DetailsTaskDto MapToDetailsDto(WorkTask taskEntity)
        => new ()
        {
            Id = taskEntity.Id,
            Title = taskEntity.Title,
            Description = taskEntity.Description,
            IsCompleted = taskEntity.IsCompleted,
            Deadline = taskEntity.Deadline,
            DealId = taskEntity.DealId,
            UserId = taskEntity.UserId,
        };
}