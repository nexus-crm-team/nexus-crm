using NexusCRM.Web.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

public class Customer
{
    public int Id { get; set; }
    public string? FullName { get; set; }

    [Required]
    [EmailAddress]
    public string? Email { get; set; }

    [Phone]
    public string? PhoneNumber { get; set; }

    //TODO: to be continued

    [Required]
    public Address? Address { get; set; }

    public CustomerStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

    public List<Deal>? Deals { get; set; }
}
