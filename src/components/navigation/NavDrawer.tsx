import { useEffect } from 'react'
import {
  CloseIcon,
  HomeIcon,
  SearchIcon,
  CalendarIcon,
  SignOutIcon,
} from '../common/Icons'

interface NavDrawerProps {
  isOpen: boolean
  onClose: () => void
  onNavigateHome: () => void
  onNavigateSearch: () => void
  onNavigateBookings: () => void
  onSignOut: () => void
}

export function NavDrawer({
  isOpen,
  onClose,
  onNavigateHome,
  onNavigateSearch,
  onNavigateBookings,
  onSignOut,
}: NavDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="nav-drawer-backdrop" onClick={onClose} aria-hidden={!isOpen}>
      <aside
        className="nav-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="nav-drawer-header">
          <button
            type="button"
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="nav-drawer-menu">
          <button
            type="button"
            className="nav-drawer-item"
            onClick={() => {
              onNavigateHome()
              onClose()
            }}
          >
            <HomeIcon className="nav-drawer-icon" />
            <span>Home</span>
          </button>

          <button
            type="button"
            className="nav-drawer-item"
            onClick={() => {
              onNavigateSearch()
              onClose()
            }}
          >
            <SearchIcon className="nav-drawer-icon" />
            <span>Search</span>
          </button>

          <button
            type="button"
            className="nav-drawer-item"
            onClick={() => {
              onNavigateBookings()
              onClose()
            }}
          >
            <CalendarIcon className="nav-drawer-icon" />
            <span>My Bookings</span>
          </button>

          <div className="nav-drawer-divider" />

          <button
            type="button"
            className="nav-drawer-item nav-drawer-signout"
            onClick={() => {
              onSignOut()
              onClose()
            }}
          >
            <SignOutIcon className="nav-drawer-icon" />
            <span>Sign Out</span>
          </button>
        </nav>
      </aside>
    </div>
  )
}
