using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

public class FollowUp
{
    public int Id { get; set; }

    [Required]
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public string AuthorId { get; set; } = null!;
    public User? Author { get; set; }
    [Required]
    public bool isCompleted { get; set; } = false;

    [Required]
    public int DealId { get; set; }
    public Deal? Deal { get; set; }

    [Required]
    public string AssignedUserId { get; set; } = null!;
    public User? AssignedUser { get; set; }

    public int? TaskId { get; set; }
    public WorkTask? Task { get; set; } = null!;
}
