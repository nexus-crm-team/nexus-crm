using Microsoft.AspNetCore.Mvc;

namespace NexusCRM.Web.Controllers;

public abstract class ApiControllerBase : ControllerBase
{
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
            return Ok(result);

        if (!string.IsNullOrEmpty(result.Message) &&
            result.Message.Contains("Not Found", StringComparison.OrdinalIgnoreCase))
            return NotFound(result);

        return BadRequest(result);
    }
}