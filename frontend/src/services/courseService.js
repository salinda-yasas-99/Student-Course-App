import { request } from './http'

export const getCourses = () => request('/api/Courses')

export const getCourseById = (courseId) => request(`/api/Courses/${courseId}`)

export const createCourse = (course) =>
  request('/api/Courses', {
    method: 'POST',
    body: JSON.stringify(course),
  })

export const updateCourse = (courseId, course) =>
  request(`/api/Courses/${courseId}`, {
    method: 'PUT',
    body: JSON.stringify(course),
  })

export const deleteCourse = (courseId) =>
  request(`/api/Courses/${courseId}`, {
    method: 'DELETE',
  })

export const getCourseStudents = (courseId) =>
  request(`/api/Courses/${courseId}/students`)