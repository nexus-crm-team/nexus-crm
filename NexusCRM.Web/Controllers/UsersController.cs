using Microsoft.AspNetCore.Mvc;
using NexusCRM.Web.DTOs.Users;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsersController(IUserService service) : Controller
{
    private readonly IUserService _service = service;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // GET api/<NotesController>/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(string id, [FromBody] UpdateUserDto? dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(result);
    }

    // DELETE api/<NotesController>/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _service.DeleteAsync(id);
        return Ok(result);
    }
}
