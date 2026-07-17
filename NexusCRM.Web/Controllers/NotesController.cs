using Microsoft.AspNetCore.Mvc;
using NexusCRM.Web.DTOs.Notes;
using NexusCRM.Web.Services.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace NexusCRM.Web.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotesController(INoteService service) : ApiControllerBase
{
    private readonly INoteService _service = service;

    // GET: api/<NotesController>
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
    public async Task<IActionResult> Post([FromBody] CreateNoteDto? dto)
    {
        var result = await _service.AddAsync(dto);
        return HandleResult(result);
    }

    // PUT api/<NotesController>/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, [FromBody] UpdateNoteDto? dto)
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

    [HttpGet("search")]
    public async Task<IActionResult> Search(string keyword)
    {
        var result = await _service.SearchAsync(keyword);
        return HandleResult(result);
    }
}
