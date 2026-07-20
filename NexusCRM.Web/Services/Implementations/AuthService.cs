using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NexusCRM.Web.Data;
using NexusCRM.Web.DTOs.Users;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Entities.Enums;
using NexusCRM.Web.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace NexusCRM.Web.Services.Implementations;

public class AuthService(
    AppDbContext context,
    UserManager<User> userManager,
    IConfiguration configuration) : IAuthService
{
    private readonly AppDbContext _context = context;
    private readonly UserManager<User> _userManager = userManager;
    private readonly IConfiguration _configuration = configuration;

    public async Task<Result<AuthResponseDto>> RegisterCompanyAdminAsync(RegisterCompanyAdminDto dto)
    {
        if (!IsValidCompanyAdminRegistration(dto))
            return Result<AuthResponseDto>.Fail("Invalid registration data.");

        var companyName = dto.CompanyName.Trim();
        var companyEmail = dto.CompanyEmail.Trim();
        var companyPhone = dto.CompanyPhone.Trim();
        var userName = dto.UserName.Trim();
        var email = dto.Email.Trim();
        var phoneNumber = dto.PhoneNumber.Trim();
        var companyAddress = dto.CompanyAddress!;

        if (await _context.Companies.AnyAsync(company =>
                company.Name == companyName ||
                company.Email == companyEmail ||
                company.PhoneNumber == companyPhone))
        {
            return Result<AuthResponseDto>.Fail(
                "A company with this name, email, or phone number already exists.");
        }

        if (await UserExistsAsync(email, userName, phoneNumber))
            return Result<AuthResponseDto>.Fail(
                "A user with this email, username, or phone number already exists.");

        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var company = new Company
            {
                Name = companyName,
                Industry = dto.Industry.Trim(),
                Email = companyEmail,
                PhoneNumber = companyPhone,
                Address = new Address
                {
                    Country = companyAddress.Country!.Trim(),
                    Region = companyAddress.Region.Trim(),
                    City = companyAddress.City!.Trim(),
                    Street = companyAddress.Street.Trim(),
                    PostalCode = companyAddress.PostalCode?.Trim()
                }
            };

            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();

            var admin = new User
            {
                UserName = userName,
                Email = email,
                PhoneNumber = phoneNumber,
                CompanyId = company.Id,
                Role = UserRole.Admin
            };

            var createUserResult = await _userManager.CreateAsync(admin, dto.Password);
            if (!createUserResult.Succeeded)
            {
                await transaction.RollbackAsync();
                return Result<AuthResponseDto>.Fail(FormatIdentityErrors(createUserResult));
            }

            await transaction.CommitAsync();
            return Result<AuthResponseDto>.Success(CreateAuthResponseDto(admin));
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            return Result<AuthResponseDto>.Fail("Registration could not be completed.");
        }
    }

    public async Task<Result<AuthResponseDto>> LoginAsync(LoginUserDto dto)
    {
        if (dto is null ||
            string.IsNullOrWhiteSpace(dto.Identifier) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return Result<AuthResponseDto>.Fail("Identifier and password are required.");
        }

        var identifier = dto.Identifier.Trim();
        var user = await _context.Users.SingleOrDefaultAsync(user =>
            user.Email == identifier ||
            user.UserName == identifier ||
            user.PhoneNumber == identifier);

        if (user is null || !await _userManager.CheckPasswordAsync(user, dto.Password))
            return Result<AuthResponseDto>.Fail("Invalid credentials.");

        return Result<AuthResponseDto>.Success(CreateAuthResponseDto(user));
    }

    public async Task<Result<bool>> RegisterCompanyEmployeeAsync(
        int companyId,
        RegisterCompanyEmployeeDto dto)
    {
        if (companyId < 1 ||
            dto is null ||
            string.IsNullOrWhiteSpace(dto.UserName) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.PhoneNumber) ||
            string.IsNullOrWhiteSpace(dto.Password) ||
            dto.Role is not (UserRole.Manager or UserRole.Employee))
        {
            return Result<bool>.Fail("Invalid employee registration data.");
        }

        var company = await _context.Companies
            .AsNoTracking()
            .SingleOrDefaultAsync(company => company.Id == companyId && company.IsActive);

        if (company is null)
            return Result<bool>.Fail("Company Not Found or inactive.");

        var userName = dto.UserName.Trim();
        var email = dto.Email.Trim();
        var phoneNumber = dto.PhoneNumber.Trim();

        if (await UserExistsAsync(email, userName, phoneNumber))
            return Result<bool>.Fail("A user with this email, username, or phone number already exists.");

        var employee = new User
        {
            UserName = userName,
            Email = email,
            PhoneNumber = phoneNumber,
            CompanyId = companyId,
            Role = dto.Role
        };

        var createUserResult = await _userManager.CreateAsync(employee, dto.Password);
        return createUserResult.Succeeded
            ? Result<bool>.Success()
            : Result<bool>.Fail(FormatIdentityErrors(createUserResult));
    }

    private AuthResponseDto CreateAuthResponseDto(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secret = jwtSettings["Secret"]
            ?? throw new InvalidOperationException("JWT secret is not configured.");

        if (!int.TryParse(jwtSettings["ExpirationMinutes"], out var expirationMinutes) ||
            expirationMinutes <= 0)
        {
            expirationMinutes = 60;
        }

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Name, user.UserName ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("companyId", user.CompanyId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAtUtc,
            signingCredentials: new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256));

        return new AuthResponseDto
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAtUtc,
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            CompanyId = user.CompanyId,
            Role = user.Role.ToString()
        };
    }

    private async Task<bool> UserExistsAsync(string email, string userName, string phoneNumber)
        => await _context.Users.AnyAsync(user =>
            user.Email == email ||
            user.UserName == userName ||
            user.PhoneNumber == phoneNumber);

    private static bool IsValidCompanyAdminRegistration(RegisterCompanyAdminDto? dto)
        => dto is not null &&
           !string.IsNullOrWhiteSpace(dto.CompanyName) &&
           !string.IsNullOrWhiteSpace(dto.Industry) &&
           !string.IsNullOrWhiteSpace(dto.CompanyEmail) &&
           !string.IsNullOrWhiteSpace(dto.CompanyPhone) &&
           dto.CompanyAddress is not null &&
           !string.IsNullOrWhiteSpace(dto.CompanyAddress.Country) &&
           !string.IsNullOrWhiteSpace(dto.CompanyAddress.Region) &&
           !string.IsNullOrWhiteSpace(dto.CompanyAddress.City) &&
           !string.IsNullOrWhiteSpace(dto.CompanyAddress.Street) &&
           !string.IsNullOrWhiteSpace(dto.UserName) &&
           !string.IsNullOrWhiteSpace(dto.Email) &&
           !string.IsNullOrWhiteSpace(dto.PhoneNumber) &&
           !string.IsNullOrWhiteSpace(dto.Password) &&
           dto.Password == dto.ConfirmPassword;

    private static string FormatIdentityErrors(IdentityResult result)
        => string.Join("; ", result.Errors.Select(error => error.Description));
}
