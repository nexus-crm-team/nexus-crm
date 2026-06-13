using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class CompanyRepository : IRepository<Company>
{
    private readonly AppDbContext _context;

    public CompanyRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task AddAsync(Company entity)
    {
        await _context.Companies.AddAsync(entity);
    }

    public async Task Delete(Company entity)
    {
        _context.Companies.Remove(entity);
    }

    public async Task<ICollection<Company>> GetAllAsync()
    {
        return await _context.Companies.ToListAsync();
    }

    public async Task<Company?> GetByIdAsync(int id)
    {
        return await _context.Companies.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(Company entity)
    {
        _context.Update(entity);
    }
}
