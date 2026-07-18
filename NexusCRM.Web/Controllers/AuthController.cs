using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusCRM.Web.DTOs.Users;
using NexusCRM.Web.Services.Interfaces;
using System.Security.Claims;

namespace NexusCRM.Web.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController(IAuthService authService) : ApiControllerBase
{
    private readonly IAuthService _authService = authService;

    [AllowAnonymous]
    [HttpPost("register-company-admin")]
    public async Task<IActionResult> RegisterCompanyAdmin(RegisterCompanyAdminDto dto)
    {
        var result = await _authService.RegisterCompanyAdminAsync(dto);
        return HandleResult(result);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginUserDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        return HandleResult(result);
    }

    [Authorize(Policy = "CompanyAdmin")]
    [HttpPost("employees")]
    public async Task<IActionResult> RegisterEmployee(
        RegisterCompanyEmployeeDto dto)
    {
        var companyId = int.Parse(
            User.FindFirstValue("companyId")!);

        var result = await _authService.RegisterCompanyEmployeeAsync(
            companyId, dto);

        return HandleResult(result);
    }
}
