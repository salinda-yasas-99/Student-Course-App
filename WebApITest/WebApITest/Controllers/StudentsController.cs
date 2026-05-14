using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApITest.DTOs.Course;
using WebApITest.DTOs.Student;
using WebApITest.Entities;
using WebApITest.Repositories.Interfaces;
using Microsoft.AspNetCore.SignalR;
using WebApITest.Hubs;

namespace WebApITest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IStudentRepository _repository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public StudentsController(IStudentRepository repository, IHubContext<NotificationHub> hubContext)
    {
        _repository = repository;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentResponseDto>>> GetAll()
    {
        var students = await _repository.GetAllAsync();
        return Ok(students.Select(s => new StudentResponseDto { Id = s.Id, Name = s.Name, Email = s.Email }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<StudentResponseDto>> GetById(int id)
    {
        var student = await _repository.GetByIdAsync(id);
        if (student == null) return NotFound();

        return Ok(new StudentResponseDto { Id = student.Id, Name = student.Name, Email = student.Email });
    }

    [HttpPost]
    public async Task<ActionResult<StudentResponseDto>> Create(CreateStudentDto dto)
    {
        var student = new Student { Name = dto.Name, Email = dto.Email };
        var created = await _repository.CreateAsync(student);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, 
            new StudentResponseDto { Id = created.Id, Name = created.Name, Email = created.Email });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateStudentDto dto)
    {
        var existing = await _repository.GetByIdAsync(id);
        if (existing == null) return NotFound();

        existing.Name = dto.Name;
        existing.Email = dto.Email;
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

    [HttpPost("{id}/courses/{courseId}")]
    public async Task<IActionResult> AssignCourse(int id, int courseId)
    {
        await _repository.AssignCourseAsync(id, courseId);
        
        // Broadcast real-time notification to all connected clients
        await _hubContext.Clients.All.SendAsync("StudentEnrolled", new 
        { 
            StudentId = id, 
            CourseId = courseId,
            Message = $"Student {id} was successfully enrolled in course {courseId}!"
        });

        return NoContent();
    }

    [HttpDelete("{id}/courses/{courseId}")]
    public async Task<IActionResult> RemoveCourse(int id, int courseId)
    {
        await _repository.RemoveCourseAsync(id, courseId);
        return NoContent();
    }

    [HttpGet("{id}/courses")]
    public async Task<ActionResult<IEnumerable<CourseResponseDto>>> GetCourses(int id)
    {
        var courses = await _repository.GetStudentCoursesAsync(id);
        return Ok(courses.Select(c => new CourseResponseDto 
        { 
            Id = c.Id, 
            CourseName = c.CourseName, 
            Description = c.Description 
        }));
    }
}
