using NexusCRM.Web.DTOs.FollowUps;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;
using NexusCRM.Web.Services.Interfaces;
using System.Security.Claims;

namespace NexusCRM.Web.Services.Implementations;

public class FollowUpService(IFollowUpRepository repository,
    IDealRepository dealRepository,
    IWorkTaskRepository workTaskRepository,
    IHttpContextAccessor httpContextAccessor) : IFollowUpService
{
    private readonly IFollowUpRepository _repository = repository;
    private readonly IDealRepository _dealRepository = dealRepository;
    private readonly IWorkTaskRepository _workTaskRepository = workTaskRepository;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;

    private string? CurrentUserId
        => _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public async Task<Result<bool>> AddAsync(CreateFollowUpDto dto)
    {
        if (dto is null)
            return Result<bool>.Fail("FollowUp cannot be null");
        if (string.IsNullOrWhiteSpace(dto.Content) || dto.Content.Length > 1000)
            return Result<bool>.Fail("Invalid note content");
        if (dto.DealId < 1)
            return Result<bool>.Fail("Invalid Input Data");

        var userId = CurrentUserId;
        if (string.IsNullOrWhiteSpace(userId))
            return Result<bool>.Fail("Invalid User Data");

        var deal = await _dealRepository.GetByIdAsync(dto.DealId);
        if (deal is null)
            return Result<bool>.Fail("Deal Not Found");

        if (dto.TaskId is not null &&
            !await _workTaskRepository.ExistsByIdAsync(dto.TaskId.Value))
            return Result<bool>.Fail("Task Not Found");

        var folup = new FollowUp
        {
            Content = dto.Content,
            CreatedAt = DateTime.Now,
            DealId = dto.DealId,
            TaskId = dto.TaskId,
            AuthorId = userId,
            AssignedUserId = userId,
        };

        await _repository.AddAsync(folup);
        await _repository.SaveAsync();
        return Result<bool>.Success();
    }

    public async Task<Result<bool>> CompleteAllForDealAsync(int dealId)
    {
        var folups = await _repository.GetByDealIdAsync(dealId);
        folups.ForEach(f => f.isCompleted = true);

        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> DeleteAsync(int id)
    {
        var folup = await _repository.GetByIdAsync(id);

        if (folup is null)
            return Result<bool>.Fail("FolUp Not Found");

        await _repository.Delete(folup);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<bool> ExistsByIdAsync(int id)
    {
        if (id <= 0)
            return false;
        return await _repository.ExistsByIdAsync(id);
    }
    public async Task<Result<List<DetailsFollowUpDto>>> GetAllAsync()
    {
        var followUps = await _repository.GetAllAsync();
        var followUpDtos = MapToDetailsDto(followUps);
        return Result<List<DetailsFollowUpDto>>.Success(followUpDtos);
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetByDealIdAsync(int dealId)
    {
        var followUps = await _repository.GetByDealIdAsync(dealId);
        var followUpDtos = MapToDetailsDto(followUps);

        return Result<List<DetailsFollowUpDto>>.Success(followUpDtos);
    }

    public async Task<Result<DetailsFollowUpDto?>> GetByIdAsync(int id)
    {
        var followUp = await _repository.GetByIdAsync(id);
        return followUp is null
            ? Result<DetailsFollowUpDto?>.Fail("FollowUp Not Found")
            : Result<DetailsFollowUpDto?>.Success(MapToDetailsDto(followUp));
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetByTaskIdAsync(int taskId)
    {
        var followUps = await _repository.GetByTaskIdAsync(taskId);
        var followUpDtos = MapToDetailsDto(followUps);

        return Result<List<DetailsFollowUpDto>>.Success(followUpDtos);
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetByUserIdAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<List<DetailsFollowUpDto>>.Fail("Invalis User Data");

        var followUps = await _repository.GetByUserIdAsync(userId);
        var followUpDtos = MapToDetailsDto(followUps);

        return Result<List<DetailsFollowUpDto>>.Success(followUpDtos);
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetCompletedAsync()
    {
        var followUps = await _repository.GetCompletedAsync();
        return followUps.Count is 0
            ? Result<List<DetailsFollowUpDto>>.Fail("FollowUp Not Found")
            : Result<List<DetailsFollowUpDto>>.Success(MapToDetailsDto(followUps));
    }

    public async Task<Result<int>> GetCompletedCountByUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<int>.Fail("Invalis User Data");

        var followUpCount = await _repository.GetCompletedCountByUserAsync(userId);

        return Result<int>.Success(followUpCount);
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetPendingAsync()
    {
        var followUps = await _repository.GetPendingAsync();
        var followUpsDtos = MapToDetailsDto(followUps);

        return Result<List<DetailsFollowUpDto>>.Success(followUpsDtos);
    }

    public async Task<Result<int>> GetPendingCountByUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<int>.Fail("Invalis User Data");

        var followUpCount = await _repository.GetPendingCountByUserAsync(userId);

        return Result<int>.Success(followUpCount);
    }

    public async Task<Result<int>> GetTotalByDealAsync(int dealId)
    {
        var followUpCount = await _repository.GetTotalByDealAsync(dealId);

        return Result<int>.Success(followUpCount);
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetWithDealAsync(int dealId)
    {
        var followUps = await _repository.GetWithDealAsync(dealId);
        var followUpsDtos = MapToDetailsDto(followUps);

        return Result<List<DetailsFollowUpDto>>.Success(followUpsDtos);
    }

    public async Task<Result<DetailsFollowUpDto?>> GetWithDetailsAsync(int id)
    {
        var followUp = await _repository.GetWithDetailsAsync(id);

        return followUp is null
            ? Result<DetailsFollowUpDto?>.Fail("FollowUp Not Found")
            : Result<DetailsFollowUpDto?>.Success(MapToDetailsDto(followUp));
    }

    public async Task<Result<List<DetailsFollowUpDto>>> GetWithUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<List<DetailsFollowUpDto>>.Fail("Invalis User Data");

        var followUps = await _repository.GetWithUserAsync(userId);
        var followUpsDtos = MapToDetailsDto(followUps);

        return Result<List<DetailsFollowUpDto>>.Success(followUpsDtos);
    }

    public async Task<Result<bool>> MarkAsCompletedAsync(int id)
    {
        var followUp = await _repository.GetByIdAsync(id);
        if (followUp is null)
            return Result<bool>.Fail("FollowUp Not Found");

        followUp.isCompleted = true;

        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> MarkAsPendingAsync(int id)
    {
        var followUp = await _repository.GetByIdAsync(id);
        if (followUp is null)
            return Result<bool>.Fail("FollowUp Not Found");

        followUp.isCompleted = false;

        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> UpdateAsync(int id, UpdateFollowUpDto updateDto)
    {
        if (updateDto is null || 
            string.IsNullOrWhiteSpace(updateDto.Content) || 
            updateDto.Content.Length > 1000)
            return Result<bool>.Fail("Invalid FollowUp Data");

        var followUp = await _repository.GetByIdAsync(id);
        if (followUp is null)
            return Result<bool>.Fail("FollowUp Not Found");

        if (updateDto.TaskId is not null &&
            !await _workTaskRepository.ExistsByIdAsync(updateDto.TaskId.Value))
            return Result<bool>.Fail("Task Not Found");

        followUp.Content = updateDto.Content;
        followUp.isCompleted = updateDto.IsCompleted;
        followUp.TaskId = updateDto.TaskId;

        _repository.Update(followUp);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public List<DetailsFollowUpDto> MapToDetailsDto(List<FollowUp>? folupEntities)
    {
        if (folupEntities is null)
            return [];

        List<DetailsFollowUpDto> folupDtos = new(folupEntities.Count);
        foreach (var folup in folupEntities)
        {
            var folupDto = new DetailsFollowUpDto
            {
                Id = folup.Id,
                Content = folup.Content,
                isCompleted = folup.isCompleted,
                DealId = folup.DealId,
                AssignedUserId = folup.AssignedUserId,
                TaskId = folup.TaskId,
            };
            folupDtos.Add(folupDto);
        }
        return folupDtos;
    }
    public DetailsFollowUpDto MapToDetailsDto(FollowUp folupEntity)
        => new()
        {
            Id = folupEntity.Id,
            Content = folupEntity.Content,
            isCompleted = folupEntity.isCompleted,
            DealId = folupEntity.DealId,
            AssignedUserId = folupEntity.AssignedUserId,
            TaskId = folupEntity.TaskId,
        };

}