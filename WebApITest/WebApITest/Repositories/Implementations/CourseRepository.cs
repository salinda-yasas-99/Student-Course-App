using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApITest.Data;
using WebApITest.Entities;
using WebApITest.Repositories.Interfaces;

namespace WebApITest.Repositories.Implementations;

public class CourseRepository : ICourseRepository
{
    private readonly AppDbContext _context;

    public CourseRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Course>> GetAllAsync()
    {
        return await _context.Courses.ToListAsync();
    }

    public async Task<Course?> GetByIdAsync(int id)
    {
        return await _context.Courses.FindAsync(id);
    }

    public async Task<Course> CreateAsync(Course course)
    {
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return course;
    }

    public async Task UpdateAsync(Course course)
    {
        _context.Courses.Update(course);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var course = await GetByIdAsync(id);
        if (course != null)
        {
            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Student>> GetCourseStudentsAsync(int courseId)
    {
        return await _context.StudentCourses
            .Where(sc => sc.CourseId == courseId)
            .Include(sc => sc.Student)
            .Select(sc => sc.Student)
            .ToListAsync();
    }
}
