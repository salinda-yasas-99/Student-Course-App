import { request } from './http'

export const getStudents = () => request('/api/Students')

export const getStudentById = (studentId) => request(`/api/Students/${studentId}`)

export const createStudent = (student) =>
  request('/api/Students', {
    method: 'POST',
    body: JSON.stringify(student),
  })

export const updateStudent = (studentId, student) =>
  request(`/api/Students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(student),
  })

export const deleteStudent = (studentId) =>
  request(`/api/Students/${studentId}`, {
    method: 'DELETE',
  })

export const getStudentCourses = (studentId) =>
  request(`/api/Students/${studentId}/courses`)

export const assignCourseToStudent = (studentId, courseId) =>
  request(`/api/Students/${studentId}/courses/${courseId}`, {
    method: 'POST',
  })

export const removeCourseFromStudent = (studentId, courseId) =>
  request(`/api/Students/${studentId}/courses/${courseId}`, {
    method: 'DELETE',
  })