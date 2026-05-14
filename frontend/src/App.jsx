import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import CoursesPage from './pages/CoursesPage'
import StudentsPage from './pages/StudentsPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300/80">
              School Admin
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Students and Courses
            </h1>
          </div>

          <nav className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
            <NavLink
              to="/students"
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              Students
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) =>
                [
                  'rounded-xl px-4 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                ].join(' ')
              }
            >
              Courses
            </NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="*" element={<Navigate to="/students" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
