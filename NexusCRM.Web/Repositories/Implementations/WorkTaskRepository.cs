using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class WorkTaskRepository : IRepository<WorkTask>
{
    private readonly AppDbContext _context;

    public WorkTaskRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task AddAsync(WorkTask entity)
    {
        await _context.Tasks.AddAsync(entity);
    }

    public async Task Delete(WorkTask entity)
    {
        _context.Tasks.Remove(entity);
    }

    public async Task<ICollection<WorkTask>> GetAllAsync()
    {
        return await _context.Tasks.ToListAsync();
    }

    public async Task<WorkTask?> GetByIdAsync(int id)
    {
        return await _context.Tasks.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(WorkTask entity)
    {
        _context.Update(entity);
    }
}
