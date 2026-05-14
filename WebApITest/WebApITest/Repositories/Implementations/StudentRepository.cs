using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using WebApITest.Data;
using WebApITest.Entities;
using WebApITest.Repositories.Interfaces;

namespace WebApITest.Repositories.Implementations;

public class StudentRepository : IStudentRepository
{
    private readonly AppDbContext _context;

    public StudentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Student>> GetAllAsync()
    {
        return await _context.Students.ToListAsync();
    }

    public async Task<Student?> GetByIdAsync(int id)
    {
        return await _context.Students.FindAsync(id);
    }

    public async Task<Student> CreateAsync(Student student)
    {
        _context.Students.Add(student);
        await _context.SaveChangesAsync();
        return student;
    }

    public async Task UpdateAsync(Student student)
    {
        _context.Students.Update(student);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var student = await GetByIdAsync(id);
        if (student != null)
        {
            _context.Students.Remove(student);
            await _context.SaveChangesAsync();
        }
    }

    public async Task AssignCourseAsync(int studentId, int courseId)
    {
        var exists = await _context.StudentCourses
            .AnyAsync(sc => sc.StudentId == studentId && sc.CourseId == courseId);
            
        if (!exists)
        {
            _context.StudentCourses.Add(new StudentCourse { StudentId = studentId, CourseId = courseId });
            await _context.SaveChangesAsync();
        }
    }

    public async Task RemoveCourseAsync(int studentId, int courseId)
    {
        var studentCourse = await _context.StudentCourses
            .FirstOrDefaultAsync(sc => sc.StudentId == studentId && sc.CourseId == courseId);
            
        if (studentCourse != null)
        {
            _context.StudentCourses.Remove(studentCourse);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<IEnumerable<Course>> GetStudentCoursesAsync(int studentId)
    {
        return await _context.StudentCourses
            .Where(sc => sc.StudentId == studentId)
            .Include(sc => sc.Course)
            .Select(sc => sc.Course)
            .ToListAsync();
    }
}
