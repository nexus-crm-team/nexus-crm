using NexusCRM.Web.Entities;
using System.ComponentModel.DataAnnotations;

namespace NexusCRM.Web.DTOs.Users;

public class RegisterCompanyAdminDto
{
    // Company data
    public string CompanyName { get; set; } = null!;
    public string Industry { get; set; } = null!;
    [EmailAddress]
    public string CompanyEmail { get; set; } = null!;
    [Phone]
    public string CompanyPhone { get; set; } = null!;
    [Required]
    public Address CompanyAddress { get; set; } = null!;

    // Admin user data
    public string UserName { get; set; } = null!;
    [EmailAddress]
    public string Email { get; set; } = null!;
    [Phone]
    public string PhoneNumber { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string ConfirmPassword { get; set; } = null!;
}