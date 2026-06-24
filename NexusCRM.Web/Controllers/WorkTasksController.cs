using Microsoft.AspNetCore.Mvc;
using NexusCRM.Web.DTOs.Tasks;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WorkTasksController(IWorkTaskService service) : Controller
{
    private readonly IWorkTaskService _service = service;
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    // GET api/<NotesController>/5
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return Ok(result);
    }

    // POST api/<NotesController>
    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CreateTaskDto? dto)
    {
        var result = await _service.AddAsync(dto);
        return Ok(result);
    }

    // PUT api/<NotesController>/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] UpdateTaskDto? dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(result);
    }

    // DELETE api/<NotesController>/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _service.DeleteAsync(id);
        return Ok(result);
    }
}
