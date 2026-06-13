using NexusCRM.Web.Entities;
using NexusCRM.Web.Entities.Enums;

namespace NexusCRM.Web.Repositories.Interfaces;

public interface ICustomerRepository
{

    // ---------------- CRM READ METHODS ----------------

    Task<List<Customer>> GetActiveAsync();

    Task<List<Customer>> GetByStatusAsync(CustomerStatus status);

    Task<List<Customer>> SearchAsync(string keyword);

    Task<List<Customer>> GetByCompanyIdAsync(int companyId);

    Task<List<Customer>> GetByEmailAsync(string email);

    Task<Customer?> GetByPhoneAsync(string phone);

    // ---------------- VALIDATION ----------------

    Task<bool> ExistsByEmailAsync(string email);

    Task<bool> ExistsByPhoneAsync(string phone);

    // ---------------- RELATIONSHIPS ----------------

    Task<Customer?> GetWithDetailsAsync(int id);

    Task<Customer?> GetWithDealsAsync(int id);

    Task<int> GetDealCountAsync(int customerId);

    // ---------------- BUSINESS ACTIONS ----------------

    Task ActivateAsync(int id);

    Task DeactivateAsync(int id);
    Task ChangeStatusAsync(int id, CustomerStatus status);
}
