using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.Entities;

public class Note
{
    public int Id { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int AuthorId { get; set; }
    public User? Author { get; set; }
}
