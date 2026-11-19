import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Database,
  Clock,
  CalendarDays,
  Network,
  Menu,
  X,
} from 'lucide-react'
const NAV_ITEMS = [
  { to: '/data', label: 'Data', icon: Database },
  { to: '/slots', label: 'Slots', icon: Clock },
  { to: '/schedule', label: 'Schedule', icon: CalendarDays },
  { to: '/graph', label: 'Graph', icon: Network },
]
function SidebarLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
          isActive
            ? 'bg-primary text-text-inverse'
            : 'text-text-secondary hover:bg-surface-alt hover:text-text',
        ].join(' ')
      }
    >
      <Icon size={18} strokeWidth={1.8} />
      <span>{label}</span>
    </NavLink>
  )
}
export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const closeMobile = () => setMobileOpen(false)
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-surface fixed inset-y-0 left-0 z-30">
        <div className="flex items-center gap-2.5 px-5 h-14 border-b border-border">
          <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-text-inverse">E</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Examly</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-text-muted">Graph-coloring scheduler</p>
        </div>
      </aside>
      <header className="md:hidden fixed top-0 inset-x-0 h-14 bg-surface border-b border-border flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-sm bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-text-inverse">E</span>
          </div>
          <span className="font-semibold text-sm tracking-tight">Examly</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md text-text-secondary hover:bg-surface-alt transition-colors cursor-pointer"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={closeMobile}
            aria-hidden="true"
          />
          <nav
            className="fixed top-14 left-0 right-0 bg-surface border-b border-border px-4 py-3 space-y-1 z-50 md:hidden shadow-md"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map((item) => (
              <SidebarLink key={item.to} {...item} onClick={closeMobile} />
            ))}
          </nav>
        </>
      )}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
