using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Entities.Enums;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class CustomerRepository : IRepository<Customer>
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
        => _context = context;

    public async Task AddAsync(Customer entity)
        => await _context.Customers.AddAsync(entity);

    public async Task Delete(Customer entity)
    {
        _context.Customers.Remove(entity);
    }

    public async Task<ICollection<Customer>> GetAllAsync()
       =>await _context.Customers
            .AsNoTracking()
            .ToListAsync();

    public async Task<Customer?> GetByIdAsync(int id)
        => await _context.Customers.FindAsync(id);

    public async Task SaveAsync()
        => await _context.SaveChangesAsync();

    public async Task Update(Customer entity)
        => _context.Update(entity);
    

    public async Task<List<Customer>> GetActiveAsync()
        => await _context.Customers
        .AsNoTracking()
        .Where(customer => customer.Status == CustomerStatus.Active)
        .ToListAsync();

    public async Task<List<Customer>> GetByStatusAsync(CustomerStatus status)
        => await _context.Customers
        .AsNoTracking()
        .Where(customer => customer.Status == status)
        .ToListAsync();
    
    public async Task<List<Customer>> SearchAsync(string keyword)
    {
        var query = _context.Customers.AsNoTracking();

        if (string.IsNullOrWhiteSpace(keyword))
            return [];

        keyword = keyword.Trim();

        return await query
            .Where(customer => customer.FullName != null && customer.FullName.Contains(keyword))
            .ToListAsync();
    }

    public async Task<List<Customer>> GetByCompanyIdAsync(int companyId)
        => await _context.Customers
            .AsNoTracking()
            .Where(customer => customer.CompanyId == companyId)
            .ToListAsync();
    

    public async Task<Customer?> GetByEmailAsync(string email)
    {
        var query = _context.Customers.AsNoTracking();

        if(string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        email = email.Trim();

        return await query
            .FirstOrDefaultAsync(customer => customer.Email == email);
    }

    public async Task<Customer?> GetByPhoneAsync(string phone)
    {
        var query = _context.Customers.AsNoTracking();

        if (string.IsNullOrWhiteSpace(phone))
            return null;


        phone = phone.Trim();

        return await query
            .AsNoTracking()
            .FirstOrDefaultAsync(customer => customer.PhoneNumber == phone);
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        var query = _context.Customers;

        if (string.IsNullOrWhiteSpace(email))
            return false;

        email = email.Trim();

        return await query.AnyAsync(customer => customer.Email == email);
        
    }

    public async Task<bool> ExistsByPhoneAsync(string phone)
    {
        var query = _context.Customers;

        if(string.IsNullOrWhiteSpace(phone))
            return false;

        phone = phone.Trim();

        return await query.AnyAsync(customer => customer.PhoneNumber != null && customer.PhoneNumber == phone);
    }

    public async Task<Customer?> GetWithDetailsAsync(int id)
    {
        return await _context.Customers
            .AsNoTracking()
            .Include(customer => customer.Deals)
            .FirstOrDefaultAsync(customer => customer.Id == id);
    }

    public async Task<Customer?> GetWithDealsAsync(int id)
    {
        return await _context.Customers
            .AsNoTracking()
            .Include(customer => customer.Deals)
            .FirstOrDefaultAsync(customer => customer.Id == id);
    }

    public async Task<int> GetDealCountAsync(int customerId)
        => await _context.Deals
            .CountAsync(deal => deal.CustomerId == customerId);
    

    public async Task ActivateAsync(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if(customer is null || customer.Status == CustomerStatus.Active)
            return;

        customer.Status = CustomerStatus.Active;
    }

    public async Task DeactivateAsync(int id)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer is null || customer.Status == CustomerStatus.Inactive)
            return;

        customer.Status = CustomerStatus.Inactive;
    }

    public async Task ChangeStatusAsync(int id, CustomerStatus status)
    {
        var customer = await _context.Customers.FindAsync(id);

        if (customer is null || customer.Status == status)
            return;

        customer.Status = status;
    }
}
