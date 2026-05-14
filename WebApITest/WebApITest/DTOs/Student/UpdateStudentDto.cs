using System.ComponentModel.DataAnnotations;

namespace WebApITest.DTOs.Student;

public class UpdateStudentDto
{
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }

    [Required]
    [EmailAddress]
    public required string Email { get; set; }
}
