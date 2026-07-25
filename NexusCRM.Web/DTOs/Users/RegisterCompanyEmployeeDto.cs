using NexusCRM.Web.Entities.Enums;
using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.DTOs.Users;

public class RegisterCompanyEmployeeDto
{
    [Required] public string UserName { get; set; } = null!;
    [Required] public string Email { get; set; } = null!;
    [Required] public string PhoneNumber { get; set; } = null!;
    [Required] public string Password { get; set; } = null!;
    public string? AvatarUrl { get; set; }
    [Required] public UserRole Role { get; set; }
}
