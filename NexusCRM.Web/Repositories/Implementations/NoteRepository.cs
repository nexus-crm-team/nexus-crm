using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;
namespace NexusCRM.Web.Repositories.Implementations;

public class NoteRepository : IRepository<Note>
{
    private readonly AppDbContext _context;

    public NoteRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task AddAsync(Note entity)
    {
        await _context.Notes.AddAsync(entity);
    }

    public async Task Delete(Note entity)
    {
        _context.Notes.Remove(entity);
    }

    public async Task<ICollection<Note>> GetAllAsync()
    {
        return await _context.Notes.ToListAsync();
    }

    public async Task<Note?> GetByIdAsync(int id)
    {
        return await _context.Notes.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(Note entity)
    {
        _context.Update(entity);
    }
}
