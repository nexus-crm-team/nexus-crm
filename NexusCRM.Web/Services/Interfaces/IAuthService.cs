using NexusCRM.Web.DTOs.Users;

namespace NexusCRM.Web.Services.Interfaces;

public interface IAuthService
{
    Task<Result<AuthResponseDto>> RegisterCompanyAdminAsync(
        RegisterCompanyAdminDto dto);

    Task<Result<AuthResponseDto>> LoginAsync(
        LoginUserDto dto);

    Task<Result<bool>> RegisterCompanyEmployeeAsync(
        int companyId,
        RegisterCompanyEmployeeDto dto);
}