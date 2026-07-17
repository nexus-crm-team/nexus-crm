using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;

namespace NexusCRM.Web.Repositories.Implementations;

public class CompanyRepository : ICompanyRepository 
{
    private readonly AppDbContext _context;
    public CompanyRepository(AppDbContext context)
        => _context = context;

    public async Task AddAsync(Company entity)
      => await _context.Companies.AddAsync(entity);

    public async Task Delete(Company entity)
       =>  _context.Companies.Remove(entity);

    public async Task<List<Company>> GetAllAsync()
        => await _context.Companies
        .AsNoTracking()
        .ToListAsync();

    public async Task<Company?> GetByIdAsync(int id)
        => await _context.Companies.FindAsync(id);

    public async Task SaveAsync()
        => await _context.SaveChangesAsync();

    public void Update(Company entity)
        => _context.Update(entity);

    public async Task<List<Company>> GetActiveAsync()
            => await _context.Companies
            .Where(company => company.IsActive)
            .AsNoTracking()
            .ToListAsync();
    public async Task<List<Company>> SearchAsync(string keyword)
    {
        keyword = keyword.Trim();

        return await _context.Companies
            .AsNoTracking()
            .Where(company => company.Name != null && company.Name.Contains(keyword))
            .ToListAsync();
    }

    public async Task<Company?> GetByEmailAsync(string email)
    {
        email = email.Trim();

        return await _context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(company => company.Email != null && company.Email == email);
    }

    public async Task<Company?> GetByPhoneAsync(string phone)
    {
        phone = phone.Trim();

        return await _context.Companies
            .AsNoTracking()
            .FirstOrDefaultAsync(company => company.PhoneNumber != null && company.PhoneNumber == phone);
    }

    public async Task<List<Company>> GetByIndustryAsync(string industry)
    {
        industry = industry.Trim();

        return await _context.Companies
            .AsNoTracking()
            .Where(company => company.Industry != null && company.Industry == industry)
            .ToListAsync();
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        email = email.Trim();

        return await _context.Companies.AnyAsync(c => c.Email != null && c.Email == email);
    }

    public async Task<bool> ExistsByPhoneAsync(string phone)
    {
        phone = phone.Trim();

        return await _context.Companies.AnyAsync(c => c.PhoneNumber != null && c.PhoneNumber == phone);
    }

    public async Task<bool> ExistsByNameAsync(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return false;

        name = name.Trim();

        return await _context.Companies.AnyAsync(company => company.Name == name);
    }

    public async Task<bool> ExistsByNameAndAddressAsync(string name, Address address)
    {
        name = name.Trim();

        return await _context.Companies.AnyAsync(company =>
            company.Address != null &&
            company.Name == name &&
            company.Address.Country == address.Country &&
            company.Address.City == address.City &&
            company.Address.Region == address.Region &&
            company.Address.Street == address.Street &&
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

    public async Task<bool> HasCustomersAsync(int companyId)
    => await _context.Customers.AnyAsync(customer => customer.CompanyId == companyId);

    public async Task<bool> HasDealsAsync(int companyId)
        => await _context.Deals.AnyAsync(deal => deal.CompanyId == companyId);

    public async Task<bool> HasUsersAsync(int companyId)
        => await _context.Users.AnyAsync(user => user.CompanyId == companyId);
}
