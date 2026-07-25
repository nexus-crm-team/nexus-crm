namespace NexusCRM.Web.DTOs.Users;

public class AuthResponseDto
{
    public string AccessToken { get; set; } = null!;
    public DateTime ExpiresAtUtc { get; set; }

    public string UserId { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? AvatarUrl { get; set; }

    public int CompanyId { get; set; }
    public string Role { get; set; } = null!;
}
