using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using NexusCRM.Web.DTOs.Companies;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Policy = "CompanyAdmin")]
public class CompaniesController(ICompanyService service) : ApiControllerBase
{
    private readonly ICompanyService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return HandleResult(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return HandleResult(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _service.GetActiveAsync();
        return HandleResult(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string keyword)
    {
        var result = await _service.SearchAsync(keyword);
        return HandleResult(result);
    }

    [HttpGet("by-industry")]
    public async Task<IActionResult> GetByIndustry([FromQuery] string industry)
    {
        var result = await _service.GetByIndustryAsync(industry);
        return HandleResult(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetWithDetails(int id)
    {
        var result = await _service.GetWithDetailsAsync(id);
        return HandleResult(result);
    }

    [HttpGet("{id}/customers")]
    public async Task<IActionResult> GetWithCustomers(int id)
    {
        var result = await _service.GetWithCustomersAsync(id);
        return HandleResult(result);
    }

    [HttpGet("{id}/deals")]
    public async Task<IActionResult> GetWithDeals(int id)
    {
        var result = await _service.GetWithDealsAsync(id);
        return HandleResult(result);
    }

    [HttpGet("{id}/customer-count")]
    public async Task<IActionResult> GetCustomerCount(int id)
    {
        var result = await _service.GetCustomerCountAsync(id);
        return HandleResult(result);
    }

    [HttpGet("{id}/deal-count")]
    public async Task<IActionResult> GetDealCount(int id)
    {
        var result = await _service.GetDealCountAsync(id);
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateCompanyDto? dto)
    {
        var result = await _service.AddAsync(dto);
        return HandleResult(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] UpdateCompanyDto? dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return HandleResult(result);
    }

    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id)
    {
        var result = await _service.ActivateAsync(id);
        return HandleResult(result);
    }

    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var result = await _service.DeactivateAsync(id);
        return HandleResult(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return HandleResult(result);
    }
}
