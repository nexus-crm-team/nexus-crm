using Microsoft.AspNetCore.Mvc;
using NexusCRM.Web.DTOs.Deals;
using NexusCRM.Web.Entities.Enums;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DealsController : ApiControllerBase
{
    private readonly IDealService _service;
    private readonly INotificationService _notificationService;

    public DealsController(IDealService service, INotificationService notificationService)
    {
        _service = service;
        _notificationService = notificationService;
    }

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

    [HttpGet("by-status")]
    public async Task<IActionResult> GetByStatus([FromQuery] DealStatus status)
    {
        var result = await _service.GetByStatusAsync(status);
        return HandleResult(result);
    }

    [HttpGet("by-customer/{customerId}")]
    public async Task<IActionResult> GetByCustomer(int customerId)
    {
        var result = await _service.GetByCustomerIdAsync(customerId);
        return HandleResult(result);
    }

    [HttpGet("by-company/{companyId}")]
    public async Task<IActionResult> GetByCompany(int companyId)
    {
        var result = await _service.GetByCompanyIdAsync(companyId);
        return HandleResult(result);
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
    {
        var result = await _service.GetActiveDealsAsync();
        return HandleResult(result);
    }

    [HttpGet("overdue")]
    public async Task<IActionResult> GetOverdue()
    {
        var result = await _service.GetOverdueDealsAsync();
        return HandleResult(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string keyword)
    {
        var result = await _service.SearchAsync(keyword);
        return HandleResult(result);
    }

    [HttpGet("{id}/details")]
    public async Task<IActionResult> GetWithDetails(int id)
    {
        var result = await _service.GetWithDetailsAsync(id);
        return HandleResult(result);
    }

    [HttpGet("company/{companyId}/total-value")]
    public async Task<IActionResult> GetTotalValueByCompany(int companyId)
    {
        var result = await _service.GetTotalEstimatedValueByCompanyAsync(companyId);
        return HandleResult(result);
    }

    [HttpGet("count-by-status")]
    public async Task<IActionResult> GetCountByStatus([FromQuery] DealStatus status)
    {
        var result = await _service.GetDealCountByStatusAsync(status);
        return HandleResult(result);
    }

    [HttpGet("pipeline-value")]
    public async Task<IActionResult> GetPipelineValue()
    {
        var result = await _service.GetTotalPipelineValueAsync();
        return HandleResult(result);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateDealDto? dto)
    {
        var result = await _service.AddAsync(dto);
        // Send notification about new deal
        if (dto != null)
        {
            await _notificationService.BroadcastAsync("New Deal", $"Deal '{dto.Title}' created", "success");
        }
        return HandleResult(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] UpdateDealDto? dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        // Notify about deal update
        await _notificationService.BroadcastAsync("Deal Updated", $"Deal #{id} updated", "info");
        return HandleResult(result);
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> ChangeStatus(int id, [FromQuery] DealStatus status)
    {
        var result = await _service.ChangeStatusAsync(id, status);
        await _notificationService.BroadcastAsync("Deal Status Changed", $"Deal #{id} status set to {status}", "info");
        return HandleResult(result);
    }

    [HttpPatch("{id}/close-won")]
    public async Task<IActionResult> CloseAsWon(int id)
    {
        var result = await _service.CloseAsWonAsync(id);
        await _notificationService.BroadcastAsync("Deal Won", $"Deal #{id} marked as won", "success");
        return HandleResult(result);
    }

    [HttpPatch("{id}/close-lost")]
    public async Task<IActionResult> CloseAsLost(int id)
    {
        var result = await _service.CloseAsLostAsync(id);
        await _notificationService.BroadcastAsync("Deal Lost", $"Deal #{id} marked as lost", "warning");
        return HandleResult(result);
    }

    [HttpPatch("{id}/estimated-value")]
    public async Task<IActionResult> UpdateEstimatedValue(int id, [FromQuery] decimal value)
    {
        var result = await _service.UpdateEstimatedValueAsync(id, value);
        await _notificationService.BroadcastAsync("Deal Value Updated", $"Deal #{id} value changed to {value}", "info");
        return HandleResult(result);
    }

    [HttpPatch("{id}/deadline")]
    public async Task<IActionResult> UpdateDeadline(int id, [FromQuery] DateTime? deadline)
    {
        var result = await _service.UpdateDeadlineAsync(id, deadline);
        await _notificationService.BroadcastAsync("Deal Deadline Updated", $"Deal #{id} deadline changed", "info");
        return HandleResult(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        await _notificationService.BroadcastAsync("Deal Deleted", $"Deal #{id} was deleted", "info");
        return HandleResult(result);
    }
}
