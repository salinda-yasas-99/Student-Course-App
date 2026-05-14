import { useEffect, useState } from 'react'
import { useRealtimeHub } from '../hooks/useRealtimeHub'
import {
  assignCourseToStudent,
  createStudent,
  deleteStudent,
  getStudentCourses,
  getStudents,
  removeCourseFromStudent,
  updateStudent,
} from '../services/studentService'
import { getRealtimeHubUrl } from '../services/realtime'

const emptyStudentForm = {
  name: '',
  email: '',
}

function StudentsPage() {
  const [students, setStudents] = useState([])
  const [studentForm, setStudentForm] = useState(emptyStudentForm)
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [relationshipForm, setRelationshipForm] = useState({
    studentId: '',
    courseId: '',
  })
  const [selectedStudentCourses, setSelectedStudentCourses] = useState([])
  const [selectedStudentCoursesLabel, setSelectedStudentCoursesLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchStudents = async () => {
    const data = await getStudents()
    return Array.isArray(data) ? data : []
  }

  const refreshStudents = async () => {
    setError('')
    setLoading(true)

    try {
      setStudents(await fetchStudents())
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const hubUrl = getRealtimeHubUrl()

  const { connectionError, connectionStatus } = useRealtimeHub({
    hubUrl,
    handlers: {
      StudentCreated: refreshStudents,
      StudentUpdated: refreshStudents,
      StudentDeleted: refreshStudents,
      StudentEnrolled: refreshStudents,
      StudentUnenrolled: refreshStudents,
    },
  })

  useEffect(() => {
    let isActive = true

    const loadInitialStudents = async () => {
      try {
        const data = await fetchStudents()

        if (isActive) {
          setStudents(data)
        }
      } catch (requestError) {
        if (isActive) {
          setError(requestError.message)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadInitialStudents()

    return () => {
      isActive = false
    }
  }, [])

  const resetStudentForm = () => {
    setStudentForm(emptyStudentForm)
    setEditingStudentId(null)
  }

  const handleStudentSubmit = async (event) => {
    event.preventDefault()
    setActionLoading(true)
    setError('')

    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, studentForm)
      } else {
        await createStudent(studentForm)
      }

      resetStudentForm()
      await refreshStudents()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    const shouldDelete = window.confirm('Delete this student?')

    if (!shouldDelete) {
      return
    }

    setActionLoading(true)
    setError('')

    try {
      await deleteStudent(studentId)
      if (editingStudentId === studentId) {
        resetStudentForm()
      }
      await refreshStudents()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditStudent = (student) => {
    setEditingStudentId(student.id)
    setStudentForm({
      name: student.name ?? '',
      email: student.email ?? '',
    })
  }

  const handleRelationshipChange = (event) => {
    const { name, value } = event.target
    setRelationshipForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const enrollCourse = async () => {
    const { studentId, courseId } = relationshipForm

    if (!studentId || !courseId) {
      setError('Provide both a student ID and a course ID.')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      await assignCourseToStudent(studentId, courseId)
      setRelationshipForm({ studentId: '', courseId: '' })
      setSelectedStudentCourses([])
      setSelectedStudentCoursesLabel('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const removeCourse = async () => {
    const { studentId, courseId } = relationshipForm

    if (!studentId || !courseId) {
      setError('Provide both a student ID and a course ID.')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      await removeCourseFromStudent(studentId, courseId)
      setRelationshipForm({ studentId: '', courseId: '' })
      setSelectedStudentCourses([])
      setSelectedStudentCoursesLabel('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const loadStudentCourses = async () => {
    const { studentId } = relationshipForm

    if (!studentId) {
      setError('Provide a student ID to load courses.')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const data = await getStudentCourses(studentId)
      setSelectedStudentCourses(Array.isArray(data) ? data : [])
      setSelectedStudentCoursesLabel(studentId)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/15 via-slate-900 to-slate-800 p-6 shadow-2xl shadow-cyan-950/30 ring-1 ring-white/5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300/80">
              Students API
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Manage student records and enrollments from one screen.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Create, update, delete, and inspect course enrollments using the
              endpoints from the backend contract.
            </p>
            <p className="mt-2 text-sm leading-6 text-cyan-200/80 sm:text-base">
              SignalR is now connected here, so student changes can refresh this page automatically.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold text-white">{students.length}</div>
              <div className="mt-1 text-sm text-slate-300">Students loaded</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold text-white">
                {editingStudentId ? 'Edit' : 'Create'}
              </div>
              <div className="mt-1 text-sm text-slate-300">Current form mode</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold text-white">
                {connectionStatus === 'connected'
                  ? 'Live'
                  : connectionStatus === 'connecting'
                    ? 'Linking'
                    : connectionStatus === 'reconnecting'
                      ? 'Retrying'
                      : 'Offline'}
              </div>
              <div className="mt-1 text-sm text-slate-300">Realtime socket</div>
              {connectionError ? (
                <div className="mt-2 text-xs leading-5 text-rose-200">{connectionError}</div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form
          onSubmit={handleStudentSubmit}
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 ring-1 ring-white/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingStudentId ? 'Edit student' : 'New student'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {editingStudentId ? `Student #${editingStudentId}` : 'Create a fresh record'}
              </p>
            </div>
            {editingStudentId ? (
              <button
                type="button"
                onClick={resetStudentForm}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Name</span>
              <input
                value={studentForm.name}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Jane Doe"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
              <input
                type="email"
                value={studentForm.email}
                onChange={(event) =>
                  setStudentForm((current) => ({ ...current, email: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="jane.doe@example.com"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading
              ? 'Working...'
              : editingStudentId
                ? 'Update student'
                : 'Create student'}
          </button>

          <div className="mt-6 grid gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span>Enroll student in course</span>
              <span className="text-xs text-slate-500">POST /api/Students/{'{id}'}/courses/{'{courseId}'}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="studentId"
                inputMode="numeric"
                value={relationshipForm.studentId}
                onChange={handleRelationshipChange}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Student ID"
              />
              <input
                name="courseId"
                inputMode="numeric"
                value={relationshipForm.courseId}
                onChange={handleRelationshipChange}
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/20"
                placeholder="Course ID"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={enrollCourse}
                disabled={actionLoading}
                className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enroll
              </button>
              <button
                type="button"
                onClick={removeCourse}
                disabled={actionLoading}
                className="rounded-2xl bg-rose-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={loadStudentCourses}
                disabled={actionLoading}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Load courses
              </button>
            </div>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 ring-1 ring-white/5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Student list</h3>
              <p className="mt-1 text-sm text-slate-400">GET /api/Students</p>
            </div>
            <button
              type="button"
              onClick={refreshStudents}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
                Loading students...
              </div>
            ) : students.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
                No students found yet.
              </div>
            ) : (
              students.map((student) => (
                <article
                  key={student.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Student #{student.id}
                      </div>
                      <h4 className="mt-1 text-lg font-semibold text-white">{student.name}</h4>
                      <p className="mt-1 text-sm text-slate-400">{student.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditStudent(student)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="rounded-xl bg-rose-400 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-rose-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
                Student courses
              </h4>
              {selectedStudentCoursesLabel ? (
                <span className="text-xs text-slate-500">Student ID {selectedStudentCoursesLabel}</span>
              ) : null}
            </div>
            {selectedStudentCourses.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Use the ID fields above to load courses for a student.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selectedStudentCourses.map((course) => (
                  <div key={course.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm font-semibold text-white">{course.courseName}</div>
                    <p className="mt-1 text-sm text-slate-400">{course.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default StudentsPage