using NexusCRM.Web.Entities;

namespace NexusCRM.Web.Repositories.Interfaces;

public interface ICompanyRepository
{
    // ---------------- CRM READ METHODS ----------------

    Task<List<Company>> GetActiveAsync();

    Task<List<Company>> SearchAsync(string keyword);

    Task<Company?> GetByEmailAsync(string email);

    Task<Company?> GetByPhoneAsync(string phone);

    Task<List<Company>> GetByIndustryAsync(string industry);

    // ---------------- VALIDATION ----------------

    Task<bool> ExistsByEmailAsync(string email);

    Task<bool> ExistsByPhoneAsync(string phone);

    Task<bool> ExistsByNameAsync(string name);

    Task<bool> ExistsByNameAndAddressAsync(string name, int addressId);

    // ---------------- RELATIONSHIPS ----------------

    Task<Company?> GetWithDetailsAsync(int id);

    Task<Company?> GetWithCustomersAsync(int id);

    Task<Company?> GetWithDealsAsync(int id);

    Task<int> GetCustomerCountAsync(int companyId);

    Task<int> GetDealCountAsync(int companyId);



    // ---------------- BUSINESS ACTIONS ----------------

    Task ActivateAsync(int id);

    Task DeactivateAsync(int id);
}
