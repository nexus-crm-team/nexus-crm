using Microsoft.AspNetCore.Identity;
using NexusCRM.Web.Entities.Enums;

namespace NexusCRM.Web.Entities;

public class User : IdentityUser
{
    public UserRole Role { get; set; }

    public string? AvatarUrl { get; set; }

    public int CompanyId { get; set; }

    public Company? Company { get; set; }

    public DateOnly RegDate { get; set; } = DateOnly.FromDateTime(DateTime.Now);

    public ICollection<Customer>? Customers { get; set; } = new List<Customer>();

    public ICollection<Deal>? Deals { get; set; } = new List<Deal>();
}
