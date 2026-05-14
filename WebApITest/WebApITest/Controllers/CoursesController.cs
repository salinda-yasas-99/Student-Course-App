using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApITest.DTOs.Course;
using WebApITest.DTOs.Student;
using WebApITest.Entities;
using WebApITest.Repositories.Interfaces;

namespace WebApITest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ICourseRepository _repository;

    public CoursesController(ICourseRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetAll()
    {
        var courses = await _repository.GetAllAsync();
        return Ok(courses.Select(c => new CourseResponseDto { Id = c.Id, CourseName = c.CourseName, Description = c.Description }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CourseResponseDto>> GetById(int id)
    {
        var course = await _repository.GetByIdAsync(id);
        if (course == null) return NotFound();

        return Ok(new CourseResponseDto { Id = course.Id, CourseName = course.CourseName, Description = course.Description });
    }

    [HttpPost]
    public async Task<ActionResult<CourseResponseDto>> Create(CreateCourseDto dto)
    {
        var course = new Course { CourseName = dto.CourseName, Description = dto.Description };
        var created = await _repository.CreateAsync(course);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, 
            new CourseResponseDto { Id = created.Id, CourseName = created.CourseName, Description = created.Description });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateCourseDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        existing.CourseName = dto.CourseName;
        existing.Description = dto.Description;
        await _repository.UpdateAsync(existing);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        await _repository.DeleteAsync(id);
        return NoContent();
    }

    [HttpGet("{id}/students")]
    public async Task<ActionResult<IEnumerable<StudentResponseDto>>> GetStudents(int id)
    {
        var students = await _repository.GetCourseStudentsAsync(id);
        return Ok(students.Select(s => new StudentResponseDto 
        { 
            Id = s.Id, 
            Name = s.Name, 
            Email = s.Email 
        }));
    }
}
