using System.Collections.Generic;

namespace WebApITest.Entities;

public class Course
{
    public int Id { get; set; }
    public required string CourseName { get; set; }
    public string? Description { get; set; }

    public ICollection<StudentCourse> StudentCourses { get; set; } = new List<StudentCourse>();
}
