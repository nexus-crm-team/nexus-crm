using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

public class Notification
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Title { get; set; } = null!;

    [Required]
    [MaxLength(500)]
    public string Message { get; set; } = null!;

    [MaxLength(20)]
    public string Type { get; set; } = "info"; // info | success | error

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // The user this notification belongs to (recipient)
    [Required]
    public string UserId { get; set; } = null!;
    public User? User { get; set; }

    // The company scope
    public int? CompanyId { get; set; }
    public Company? Company { get; set; }
}
