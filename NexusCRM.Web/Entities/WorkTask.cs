using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

public class WorkTask
{
    public int Id { get; set; }

    [Required]
    [StringLength(30)]
    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    [Required]
    public DateTime Deadline { get; set; }

    [Required]
    public bool IsCompleted { get; set; } = false;

    [Required]
    public int UserId { get; set; }
    public User? User { get; set; }

    [Required]
    public int DealId { get; set; }

    [Required]
    public Deal? Deal { get; set; }
}
