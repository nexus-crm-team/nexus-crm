using Microsoft.EntityFrameworkCore;
using NexusCRM.Web.Data;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Entities.Enums;
using NexusCRM.Web.Repositories.Interfaces;
using System.ComponentModel.Design;

namespace NexusCRM.Web.Repositories.Implementations;

public class DealRepository : IRepository<Deal>
{
    private readonly AppDbContext _context;

    public DealRepository(AppDbContext context)
        => _context = context;
    
    public async Task AddAsync(Deal entity)
    => await _context.Deals.AddAsync(entity);

    public async Task Delete(Deal entity)
        => _context.Deals.Remove(entity);

    public async Task<ICollection<Deal>> GetAllAsync()
        => await _context.Deals.ToListAsync();

    public async Task<Deal?> GetByIdAsync(int id)
        => await _context.Deals.FindAsync(id);

    public async Task SaveAsync()
        => await _context.SaveChangesAsync();

    public async Task Update(Deal entity)
        => _context.Update(entity);

    public async Task<List<Deal>> GetByStatusAsync(DealStatus status)
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.Status == status)
        .ToListAsync();

    public async Task<List<Deal>> GetByCustomerIdAsync(int customerId)
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.CustomerId == customerId)
        .ToListAsync();

    public async Task<List<Deal>> GetByCompanyIdAsync(int companyId)
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.CompanyId == companyId)
        .ToListAsync();

    public async Task<List<Deal>> GetActiveDealsAsync()
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.Status == DealStatus.New ||
            deal.Status == DealStatus.InProgress)
        .ToListAsync();

    public async Task<List<Deal>> GetOverdueDealsAsync()
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.Deadline.HasValue &&
            deal.Deadline < DateTime.UtcNow &&
            deal.Status == DealStatus.InProgress)
        .ToListAsync();

    public async Task<List<Deal>> SearchAsync(string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return [];

        keyword = keyword.Trim();

        return await _context.Deals
            .AsNoTracking()
            .Where(deal => deal.Title != null && deal.Title.Contains(keyword))
            .ToListAsync();
    }

    public async Task<Deal?> GetWithDetailsAsync(int id)
        => await _context.Deals
        .AsNoTracking()
        .Include(deal => deal.Customer)
        .FirstOrDefaultAsync(deal => deal.Id == id);

    public async Task<List<Deal>> GetWithCustomerAsync(int customerId)
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.CustomerId == customerId)
        .Include(deal => deal.Customer)
        .ToListAsync();

    public async Task<List<Deal>> GetWithCompanyAsync(int companyId)
        => await _context.Deals
        .AsNoTracking()
        .Where(deal => deal.CompanyId == companyId)
        .Include(deal => deal.Company)
        .ToListAsync();

    public async Task ChangeStatusAsync(int id, DealStatus status)
    {
        Deal? deal = await _context.Deals.FindAsync(id);

        if (deal is null || deal.Status == status)
            return;

        deal.Status = status;
    }

    public async Task CloseAsWonAsync(int id)
    {
        Deal? deal = await _context.Deals.FindAsync(id);

        if(deal is null || deal.Status == DealStatus.Ended)
            return;

        deal.Status = DealStatus.Ended;
    }

    public async Task CloseAsLostAsync(int id)
    {
        Deal? deal = await _context.Deals.FindAsync(id);

        if (deal is null || deal.Status == DealStatus.Cancelled)
            return;

        deal.Status = DealStatus.Cancelled;
    }

    public async Task UpdateEstimatedValueAsync(int id, decimal value)
    {
        Deal? deal = await _context.Deals.FindAsync(id);

        if (deal is null ||
            value < 0 ||
            deal.EstimatedValue == value)
            return;

        deal.EstimatedValue = value;
    }


    public async Task UpdateDeadlineAsync(int id, DateTime? deadline)
    {
        Deal? deal = await _context.Deals.FindAsync(id);

        if(deal is null) return;
        if(deal.Deadline == deadline) return;

        deal.Deadline = deadline;
    }

    public async Task<decimal> GetTotalEstimatedValueByCompanyAsync(int companyId)
        => await _context.Deals
        .Where(deal => deal.CompanyId == companyId)
        .SumAsync(deal => deal.EstimatedValue) ?? 0m;

    public async Task<int> GetDealCountByStatusAsync(DealStatus status)
        => await _context.Deals
        .CountAsync(deal => deal.Status == status);

    public async Task<decimal> GetTotalPipelineValueAsync()
        => await _context.Deals
        .SumAsync(deal => deal.EstimatedValue) ?? 0m;

    public async Task<bool> ExistsByTitleAsync(string title, int companyId)
    {
        if(string.IsNullOrWhiteSpace(title)) return false;

        title = title.Trim();

        return await _context.Deals
            .Where(deal => deal.CompanyId == companyId)
            .AnyAsync(deal => deal.Title == title);
    }
}
