using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class FollowUpRepository : IRepository<FollowUp>
{
    private readonly AppDbContext _context;

    public FollowUpRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task AddAsync(FollowUp entity)
    {
        await _context.FollowUps.AddAsync(entity);
    }

    public async Task Delete(FollowUp entity)
    {
        _context.FollowUps.Remove(entity);
    }

    public async Task<ICollection<FollowUp>> GetAllAsync()
    {
        return await _context.FollowUps.ToListAsync();
    }

    public async Task<FollowUp?> GetByIdAsync(int id)
    {
        return await _context.FollowUps.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(FollowUp entity)
    {
        _context.Update(entity);
    }
}
