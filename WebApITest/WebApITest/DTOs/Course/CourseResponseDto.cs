namespace WebApITest.DTOs.Course;

public class CourseResponseDto
{
    public int Id { get; set; }
    public required string CourseName { get; set; }
    public string? Description { get; set; }
}
