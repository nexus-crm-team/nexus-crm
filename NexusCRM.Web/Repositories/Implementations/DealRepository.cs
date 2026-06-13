using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class DealRepository : IRepository<Deal>
{
    private readonly AppDbContext _context;

    public DealRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task AddAsync(Deal entity)
    {
        await _context.Deals.AddAsync(entity);
    }

    public async Task Delete(Deal entity)
    {
        _context.Deals.Remove(entity);
    }

    public async Task<ICollection<Deal>> GetAllAsync()
    {
        return await _context.Deals.ToListAsync();
    }

    public async Task<Deal?> GetByIdAsync(int id)
    {
        return await _context.Deals.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(Deal entity)
    {
        _context.Update(entity); 
    }
}
