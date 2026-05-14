using System.Collections.Generic;
using System.Threading.Tasks;
using WebApITest.Entities;

namespace WebApITest.Repositories.Interfaces;

public interface ICourseRepository
{
    Task<IEnumerable<Course>> GetAllAsync();
    Task<Course?> GetByIdAsync(int id);
    Task<Course> CreateAsync(Course course);
    Task UpdateAsync(Course course);
    Task DeleteAsync(int id);
    
    Task<IEnumerable<Student>> GetCourseStudentsAsync(int courseId);
}
