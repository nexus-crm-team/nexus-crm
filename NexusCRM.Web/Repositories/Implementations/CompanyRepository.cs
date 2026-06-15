using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class CompanyRepository : IRepository<Company>
{
    private readonly AppDbContext _context;

    public CompanyRepository(AppDbContext context)
        => _context = context;
    public async Task AddAsync(Company entity)
      => await _context.Companies.AddAsync(entity);

    public async Task Delete(Company entity)
       => _context.Companies.Remove(entity);

    public async Task<ICollection<Company>> GetAllAsync()
        => await _context.Companies
        .AsNoTracking()
        .ToListAsync();

    public async Task<Company?> GetByIdAsync(int id)
        => await _context.Companies.FindAsync(id);

    public async Task SaveAsync()
        => await _context.SaveChangesAsync();

    public async Task Update(Company entity)
        => _context.Update(entity);

    public async Task<List<Company>> GetActiveAsync()
            => await _context.Companies
            .Where(company => company.IsActive)
            .AsNoTracking()
            .ToListAsync();
    public async Task<List<Company>> SearchAsync(string keyword)
    {
        var query = _context.Companies
            .AsNoTracking();

        if (string.IsNullOrWhiteSpace(keyword))
            return [];

        keyword = keyword.Trim();

        return await query
            .Where(company => company.Name != null && company.Name.Contains(keyword))
            .ToListAsync();
    }

    public async Task<Company?> GetByEmailAsync(string email)
    {
        var query = _context.Companies.AsNoTracking();

        if (string.IsNullOrWhiteSpace(email))
            return null;

        email = email.Trim();

        return await query
            .FirstOrDefaultAsync(company => company.Email != null && company.Email == email);
    }

    public async Task<Company?> GetByPhoneAsync(string phone)
    {
        var query = _context.Companies.AsNoTracking();

        if (string.IsNullOrWhiteSpace(phone))
            return null;

        phone = phone.Trim();

        return await query
            .FirstOrDefaultAsync(company => company.PhoneNumber != null && company.PhoneNumber == phone);
    }

    public async Task<List<Company>> GetByIndustryAsync(string industry)
    {
        var query = _context.Companies
            .AsNoTracking();

        if (string.IsNullOrWhiteSpace(industry))
            return [];

        industry = industry.Trim();

        return await query
            .Where(company => company.Industry != null && company.Industry == industry)
            .ToListAsync();
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        var query = _context.Companies;

        if (string.IsNullOrWhiteSpace(email))
            return false;

        email = email.Trim();

        return await query.AnyAsync(c => c.Email != null && c.Email == email);
    }

    public async Task<bool> ExistsByPhoneAsync(string phone)
    {
        var query = _context.Companies;

        if (string.IsNullOrWhiteSpace(phone))
            return false;

        phone = phone.Trim();

        return await query.AnyAsync(c => c.PhoneNumber != null && c.PhoneNumber == phone);
    }

    // TODO: Անվանումը կարող է կրկնվել | Task<bool> ExistsByNameAsync(string name);

    public async Task<bool> ExistsByNameAndAddressAsync(string name, Address? address)
    {
        if (string.IsNullOrWhiteSpace(name) || address is null)
            return false;

        name = name.Trim();

        return await _context.Companies.AnyAsync(company =>
            company.Address != null &&
            company.Name == name &&
            company.Address.Country == address.Country &&
            company.Address.City == address.City &&
            company.Address.Line1 == address.Line1 &&
            company.Address.Line2 == address.Line2 &&
            company.Address.PostalCode == address.PostalCode
        );
    }

    public async Task<Company?> GetWithDetailsAsync(int id)
            => await _context.Companies
            .AsNoTracking()
            .Include(company => company.Customers)
            .Include(company => company.Deals)
            .AsSplitQuery()
            .FirstOrDefaultAsync(company => company.Id == id);

    public async Task<Company?> GetWithCustomersAsync(int id)
            => await _context.Companies
            .AsNoTracking()
            .Include(company => company.Customers)
            .FirstOrDefaultAsync(company => company.Id == id);

    public async Task<Company?> GetWithDealsAsync(int id)
            => await _context.Companies
            .AsNoTracking()
            .Include(company => company.Deals)
            .FirstOrDefaultAsync(company => company.Id == id);

    public async Task<int> GetCustomerCountAsync(int id)
            => await _context.Customers
            .CountAsync(customer => customer.CompanyId == id);

    public async Task<int> GetDealCountAsync(int id)
            => await _context.Deals
            .CountAsync(deal => deal.CompanyId == id);

    public async Task ActivateAsync(int id)
    {
        Company? company = await _context.Companies.FindAsync(id);
        if (company is null || company.IsActive)
            return;

        company.IsActive = true;
    }

    public async Task DeactivateAsync(int id)
    {
        Company? company = await _context.Companies.FindAsync(id);
        if (company is null || !company.IsActive)
            return;

        company.IsActive = false;
        await _context.SaveChangesAsync();
    }
}
