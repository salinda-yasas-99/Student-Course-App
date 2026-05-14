using System.ComponentModel.DataAnnotations;

namespace WebApITest.DTOs.Course;

public class UpdateCourseDto
{
    [Required]
    [StringLength(100)]
    public required string CourseName { get; set; }

    public string? Description { get; set; }
}
