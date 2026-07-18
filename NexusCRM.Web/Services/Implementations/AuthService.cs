using Microsoft.AspNetCore.Identity;
using NexusCRM.Web.Data;
using NexusCRM.Web.DTOs.Users;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Entities.Enums;
using NexusCRM.Web.Services.Interfaces;
using System.Security.Claims;

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
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var company = new Company
            {
                Name = dto.CompanyName.Trim(),
                Industry = dto.Industry.Trim(),
                Email = dto.Email.Trim(),
                PhoneNumber = dto.CompanyEmail.Trim(),
                Address = new Address
                {
                    Country = dto.CompanyAddress.Country,
                    Region = dto.CompanyAddress.Region,
                    City = dto.CompanyAddress.City,
                    Street = dto.CompanyAddress.Street,
                    PostalCode = dto.CompanyAddress.PostalCode
                }
            };

            await _context.Companies.AddAsync(company);
            await _context.SaveChangesAsync();

            var admin = new User
            {
                UserName = dto.UserName.Trim(),
                Email = dto.Email.Trim(),
                PhoneNumber = dto.PhoneNumber.Trim(),
                CompanyId = company.Id,
                Role = UserRole.Admin
            };

            var createUserResult = _userManager.CreateAsync(admin, dto.Password);

            if (!createUserResult.IsCompletedSuccessfully)
            {
                await transaction.RollbackAsync();

                return Result<AuthResponseDto>.Fail("Message");
            }

            await transaction.CommitAsync();
            return Result<AuthResponseDto>.Success();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public AuthResponseDto CreateAuthResponseDto(User user)
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id);
        new Claim(ClaimTypes.Email, user.Email);
        new Claim("companyId", user.CompanyId.ToString());
        new Claim("role", user.Role.ToString());

        return new AuthResponseDto
        {

        };
    }

    public Task<Result<AuthResponseDto>> LoginAsync(LoginUserDto dto)
    {
        throw new NotImplementedException();
    }

    public Task<Result<bool>> RegisterCompanyEmployeeAsync(int companyId, RegisterCompanyEmployeeDto dto)
    {
        throw new NotImplementedException();
    }
}
