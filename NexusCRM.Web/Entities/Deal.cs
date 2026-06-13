using NexusCRM.Web.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

public class Deal
{
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    public string? Title { get; set; }

    [Required]
    public string? Description { get; set; }

    public decimal? EstimatedValue { get; set; }

    public DealStatus Status { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? Deadline { get; set; }

    [Required]
    public int CustomerId { get; set; }

    public Customer? Customer { get; set; }

    public int? CompanyId { get; set; }

    public Company? Company { get; set; }
}
