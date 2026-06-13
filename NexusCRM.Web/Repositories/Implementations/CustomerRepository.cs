using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class CustomerRepository : IRepository<Customer>
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Customer entity)
    {
        await _context.Customers.AddAsync(entity);
    }

    public async Task Delete(Customer entity)
    {
        _context.Customers.Remove(entity);
    }

    public async Task<ICollection<Customer>> GetAllAsync()
    {
        return await _context.Customers.ToListAsync();
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        return await _context.Customers.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(Customer entity)
    {
        _context.Update(entity);
    }
}
