using System.ComponentModel.DataAnnotations;

namespace WebApITest.DTOs.Student;

public class CreateStudentDto
{
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}
