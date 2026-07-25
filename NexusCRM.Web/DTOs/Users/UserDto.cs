using NexusCRM.Web.Entities.Enums;

namespace NexusCRM.Web.DTOs.Users;

public class UserDto
{
    public string Id { get; set; } = null!;
    public string? UserName { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public DateOnly RegDate { get; set; }
}
