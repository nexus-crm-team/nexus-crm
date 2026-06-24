using NexusCRM.Web.DTOs.Notes;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Services.Implementations;

public class NoteService(INoteRepository repository) : INoteService
{
    private readonly INoteRepository _repository = repository;

    public async Task<Result<bool>> AddAsync(CreateNoteDto? dto)
    {
        if (dto is null)
            return Result<bool>.Fail("Note cannot be null");
        if (string.IsNullOrWhiteSpace(dto.Content) || dto.Content.Length > 1000)
            return Result<bool>.Fail("Invalid note content");

        var note = new Note
        {
            Content = dto.Content,
            CreatedAt = DateTime.Now,
        };

        await _repository.AddAsync(note);
        await _repository.SaveAsync();
        return Result<bool>.Success();
    }

    public async Task<Result<bool>> DeleteAsync(int id)
    {
        var note = await _repository.GetByIdAsync(id);

        if (note is null)
            return Result<bool>.Fail("Note Not Found");

        await _repository.Delete(note);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> ExistsByIdAsync(int id)
    {
        if (id <= 0)
            return Result<bool>.Fail("Invalid note id");

        var exists = await _repository.ExistsByIdAsync(id);

        return Result<bool>.Success(exists);
    }

    public async Task<Result<List<DetailsNoteDto>>> GetAllAsync()
    {
        var notes = await _repository.GetAllAsync();
        var noteDtos = MapToDetailsDto(notes);

        return Result<List<DetailsNoteDto>>.Success(noteDtos);
    }

    public async Task<Result<List<DetailsNoteDto>>> GetByAuthorIdAsync(string authorId)
    {
        if (string.IsNullOrWhiteSpace(authorId))
            return Result<List<DetailsNoteDto>>.Fail("Author Not Found");

        var notes = await _repository.GetByAuthorIdAsync(authorId);
        var noteDtos = MapToDetailsDto(notes);

        return Result<List<DetailsNoteDto>>.Success(noteDtos);
    }

    public async Task<Result<DetailsNoteDto>> GetByIdAsync(int id)
    {
        var note = await _repository.GetByIdAsync(id);
        if (note is null)
            return Result<DetailsNoteDto>.Fail("Note Not Found");

        var noteDto = MapToDetailsDto(note);
        return Result<DetailsNoteDto>.Success(noteDto);
    }

    public async Task<Result<List<DetailsNoteDto>>> GetRecentAsync(int count)
    {
        if (count == 0)
            return Result<List<DetailsNoteDto>>.Fail("Invalid Count");

        var noteEntities = await _repository.GetRecentAsync(count);
        var noteDtos = MapToDetailsDto(noteEntities);

        return Result<List<DetailsNoteDto>>.Success(noteDtos);
    }

    public async Task<Result<List<DetailsNoteDto>>> GetTimelineByDateRangeAsync(DateTime from, DateTime to)
    {
        if (from > to)
            return Result<List<DetailsNoteDto>>.Fail("Invalid Datas");

        var noteEntities = await _repository.GetTimelineByDateRangeAsync(from, to);
        var noteDtos = MapToDetailsDto(noteEntities);
        
        return Result<List<DetailsNoteDto>>.Success(noteDtos);
    }

    public async Task<Result<List<DetailsNoteDto>>> GetTimelineByUserAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return Result<List<DetailsNoteDto>>.Fail("Author Not Found");

        var noteEntities = await _repository.GetTimelineByUserAsync(userId);
        if (noteEntities.Count == 0)
            return Result<List<DetailsNoteDto>>.Success(new List<DetailsNoteDto>());

        List<DetailsNoteDto> noteDtos = new(noteEntities.Count);
        foreach (var note in noteEntities)
        {
            var noteDto = new DetailsNoteDto
            {
                Id = note.Id,
                Content = note.Content,
                AuthorId = note.AuthorId,
                AuthorEmail = note.Author?.Email,
                AuthorName = note.Author?.UserName
            };
            noteDtos.Add(noteDto);
        }
        return Result<List<DetailsNoteDto>>.Success(noteDtos);
    }

    public async Task<Result<DetailsNoteDto>> GetWithAuthorAsync(int id)
    {
        var note = await _repository.GetByIdAsync(id);
        if (note is null)
            return Result<DetailsNoteDto>.Fail("Note Not Found");

        DetailsNoteDto noteDto = new()
        {
            Id = note.Id,
            Content = note.Content,
            AuthorId = note.AuthorId,
            AuthorEmail = note.Author?.Email,
            AuthorName = note.Author?.UserName
        };
        return Result<DetailsNoteDto>.Success(noteDto);
    }

    public async Task<List<DetailsNoteDto>> GetWithAuthorsAsync()
    {
        var noteEntities = await _repository.GetWithAuthorsAsync();
        var noteDtos = MapToDetailsDto(noteEntities);

        return noteDtos;
    }

    public async Task<Result<List<DetailsNoteDto>>> SearchAsync(string? keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Result<List<DetailsNoteDto>>.Fail("Search keyword is required");

        var noteEntities = await _repository.SearchAsync(keyword);
        var noteDtos = MapToDetailsDto(noteEntities);

        return Result<List<DetailsNoteDto>>.Success(noteDtos);
        
    }

    public async Task<Result<bool>> UpdateAsync(int id, UpdateNoteDto? dto)
    {
        if (dto is null)
            return Result<bool>.Fail("Invalid note data");
        if (string.IsNullOrWhiteSpace(dto.Content) || dto.Content.Length > 1000)
            return Result<bool>.Fail("Invalid note content");

        var noteEntity = await _repository.GetByIdAsync(id);
        if (noteEntity is null)
            return Result<bool>.Fail("Note Not Found");

        noteEntity.Content = dto.Content;
        _repository.Update(noteEntity);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public List<DetailsNoteDto> MapToDetailsDto(List<Note>? noteEntities)
    {
        if (noteEntities is null)
            return new List<DetailsNoteDto>();

        /*var noteDtos = notes.Select(note => new DetailsNoteDto
        {
            Id = note.Id,
            Content = note.Content,
            AuthorId = note.AuthorId,
            AuthorEmail = note.Author?.Email,
            AuthorName = note.Author?.UserName
        }).ToList();*/

        List<DetailsNoteDto> noteDtos = new(noteEntities.Count);
        foreach (var note in noteEntities)
        {
            var noteDto = new DetailsNoteDto
            {
                Id = note.Id,
                Content = note.Content,
                AuthorId = note.AuthorId,
                AuthorEmail = note.Author?.Email,
                AuthorName = note.Author?.UserName
            };
            noteDtos.Add(noteDto);
        }
        return noteDtos;
    }
    public DetailsNoteDto MapToDetailsDto(Note noteEntity)
        => new()
        {
            Id = noteEntity.Id,
            Content = noteEntity.Content,
            AuthorId = noteEntity.AuthorId,
            AuthorEmail = noteEntity.Author?.Email,
            AuthorName = noteEntity.Author?.UserName
        };
    
}
