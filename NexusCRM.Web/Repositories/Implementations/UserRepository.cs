using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;
namespace NexusCRM.Web.Repositories.Implementations;

public class UserRepository : IRepository<User>
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(User entity)
    {
        await _context.Users.AddAsync(entity);
    }

    public async Task Delete(User entity)
    {
        _context.Users.Remove(entity);
    }

    public async Task<ICollection<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task Update(User entity)
    {
        _context.Update(entity);
    }
}
