using System.Collections.Generic;
using System.Threading.Tasks;
using WebApITest.Entities;

namespace WebApITest.Repositories.Interfaces;

public interface IStudentRepository
{
    Task<IEnumerable<Student>> GetAllAsync();
    Task<Student?> GetByIdAsync(int id);
    Task<Student> CreateAsync(Student student);
    Task UpdateAsync(Student student);
    Task DeleteAsync(int id);
    
    Task AssignCourseAsync(int studentId, int courseId);
    Task RemoveCourseAsync(int studentId, int courseId);
    Task<IEnumerable<Course>> GetStudentCoursesAsync(int studentId);
}
