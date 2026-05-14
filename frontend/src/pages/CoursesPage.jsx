import { useEffect, useState } from 'react'
import { useRealtimeHub } from '../hooks/useRealtimeHub'
import {
  createCourse,
  deleteCourse,
  getCourseStudents,
  getCourses,
  updateCourse,
} from '../services/courseService'
import { getRealtimeHubUrl } from '../services/realtime'

const emptyCourseForm = {
  courseName: '',
  description: '',
}

function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [courseForm, setCourseForm] = useState(emptyCourseForm)
  const [editingCourseId, setEditingCourseId] = useState(null)
  const [lookupCourseId, setLookupCourseId] = useState('')
  const [selectedCourseStudents, setSelectedCourseStudents] = useState([])
  const [selectedCourseStudentsLabel, setSelectedCourseStudentsLabel] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCourses = async () => {
    const data = await getCourses()
    return Array.isArray(data) ? data : []
  }

  const refreshCourses = async () => {
    setError('')
    setLoading(true)

    try {
      setCourses(await fetchCourses())
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
      CourseCreated: refreshCourses,
      CourseUpdated: refreshCourses,
      CourseDeleted: refreshCourses,
      StudentEnrolled: refreshCourses,
      StudentUnenrolled: refreshCourses,
    },
  })

  useEffect(() => {
    let isActive = true

    const loadInitialCourses = async () => {
      try {
        const data = await fetchCourses()

        if (isActive) {
          setCourses(data)
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

    void loadInitialCourses()

    return () => {
      isActive = false
    }
  }, [])

  const resetCourseForm = () => {
    setCourseForm(emptyCourseForm)
    setEditingCourseId(null)
  }

  const handleCourseSubmit = async (event) => {
    event.preventDefault()
    setActionLoading(true)
    setError('')

    try {
      if (editingCourseId) {
        await updateCourse(editingCourseId, courseForm)
      } else {
        await createCourse(courseForm)
      }

      resetCourseForm()
      await refreshCourses()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId) => {
    const shouldDelete = window.confirm('Delete this course?')

    if (!shouldDelete) {
      return
    }

    setActionLoading(true)
    setError('')

    try {
      await deleteCourse(courseId)
      if (editingCourseId === courseId) {
        resetCourseForm()
      }
      await refreshCourses()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditCourse = (course) => {
    setEditingCourseId(course.id)
    setCourseForm({
      courseName: course.courseName ?? '',
      description: course.description ?? '',
    })
  }

  const loadCourseStudents = async () => {
    if (!lookupCourseId) {
      setError('Provide a course ID to load students.')
      return
    }

    setActionLoading(true)
    setError('')

    try {
      const data = await getCourseStudents(lookupCourseId)
      setSelectedCourseStudents(Array.isArray(data) ? data : [])
      setSelectedCourseStudentsLabel(lookupCourseId)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-slate-900 to-slate-800 p-6 shadow-2xl shadow-fuchsia-950/30 ring-1 ring-white/5 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-fuchsia-300/80">
              Courses API
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Organize course records and inspect enrolled students.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
              Manage course data with a dedicated page backed by the documented REST endpoints.
            </p>
            <p className="mt-2 text-sm leading-6 text-fuchsia-200/80 sm:text-base">
              SignalR is now connected here, so course and enrollment changes can refresh this page automatically.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[420px]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold text-white">{courses.length}</div>
              <div className="mt-1 text-sm text-slate-300">Courses loaded</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl font-semibold text-white">
                {editingCourseId ? 'Edit' : 'Create'}
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
          onSubmit={handleCourseSubmit}
          className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 ring-1 ring-white/5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-white">
                {editingCourseId ? 'Edit course' : 'New course'}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                {editingCourseId ? `Course #${editingCourseId}` : 'Create a fresh record'}
              </p>
            </div>
            {editingCourseId ? (
              <button
                type="button"
                onClick={resetCourseForm}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Course name</span>
              <input
                value={courseForm.courseName}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, courseName: event.target.value }))
                }
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20"
                placeholder="Mathematics 101"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Description</span>
              <textarea
                value={courseForm.description}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, description: event.target.value }))
                }
                className="min-h-36 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20"
                placeholder="Introduction to basic mathematics."
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-fuchsia-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-fuchsia-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading
              ? 'Working...'
              : editingCourseId
                ? 'Update course'
                : 'Create course'}
          </button>

          <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span>Load students in a course</span>
              <span className="text-xs text-slate-500">GET /api/Courses/{'{id}'}/students</span>
            </div>
            <div className="mt-3 flex gap-3">
              <input
                value={lookupCourseId}
                onChange={(event) => setLookupCourseId(event.target.value)}
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/20"
                placeholder="Course ID"
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={loadCourseStudents}
                disabled={actionLoading}
                className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Load
              </button>
            </div>
          </div>
        </form>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/40 ring-1 ring-white/5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">Course list</h3>
              <p className="mt-1 text-sm text-slate-400">GET /api/Courses</p>
            </div>
            <button
              type="button"
              onClick={refreshCourses}
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Refresh
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
                Loading courses...
              </div>
            ) : courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-slate-400">
                No courses found yet.
              </div>
            ) : (
              courses.map((course) => (
                <article
                  key={course.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-fuchsia-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                        Course #{course.id}
                      </div>
                      <h4 className="mt-1 text-lg font-semibold text-white">{course.courseName}</h4>
                      <p className="mt-1 text-sm text-slate-400">{course.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditCourse(course)}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCourse(course.id)}
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
              <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-300/80">
                Course students
              </h4>
              {selectedCourseStudentsLabel ? (
                <span className="text-xs text-slate-500">Course ID {selectedCourseStudentsLabel}</span>
              ) : null}
            </div>
            {selectedCourseStudents.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Use the ID field above to load students for a course.
              </p>
            ) : (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {selectedCourseStudents.map((student) => (
                  <div key={student.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="text-sm font-semibold text-white">{student.name}</div>
                    <p className="mt-1 text-sm text-slate-400">{student.email}</p>
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

export default CoursesPage