using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NexusCRM.Web.DTOs.Tasks;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WorkTasksController(IWorkTaskService service) : ApiControllerBase
{
    private readonly IWorkTaskService _service = service;
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return HandleResult(result);
    }

    // GET api/<NotesController>/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return HandleResult(result);
    }

    // POST api/<NotesController>
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateTaskDto? dto)
    {
        var result = await _service.AddAsync(dto);
        return HandleResult(result);
    }

    // PUT api/<NotesController>/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] UpdateTaskDto? dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return HandleResult(result);
    }

    // DELETE api/<NotesController>/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return HandleResult(result);
    }
}
