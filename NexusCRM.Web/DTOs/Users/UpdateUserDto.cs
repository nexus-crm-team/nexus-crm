using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.DTOs.Users;

public class UpdateUserDto
{
    [Required]
    public string UserName { get; set; } = null!; 
    [Required] 
    public string Email { get; set; } = null!;
    [Required] 
    public string PhoneNumber { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    public string? Password { get; set; }
}
