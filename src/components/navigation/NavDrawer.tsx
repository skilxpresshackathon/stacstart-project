import { useEffect } from 'react'
import {
  CloseIcon,
  HomeIcon,
  SearchIcon,
  CalendarIcon,
  SignOutIcon,
  DashboardGridIcon,
  VideoCameraIcon,
  ShieldCheckIcon,
  UserIcon,
} from '../common/Icons'
import type { User } from '../../types/marketplace'

interface NavDrawerProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onSignIn?: () => void
  onNavigateHome: () => void
  onNavigateSearch: () => void
  onNavigateBookings: () => void
  onNavigateProviderHub?: () => void
  onNavigateVideoModeration?: () => void
  onNavigateAdminDashboard?: () => void
  onNavigateIdVerification?: () => void
  onNavigateProviderSignup?: () => void
  onSignOut: () => void
  isProvider?: boolean
  isAdmin?: boolean
  currentView?: string
}

export function NavDrawer({
  isOpen,
  onClose,
  user,
  onSignIn,
  onNavigateHome,
  onNavigateSearch,
  onNavigateBookings,
  onNavigateProviderHub,
  onNavigateVideoModeration,
  onNavigateAdminDashboard,
  onNavigateIdVerification,
  onNavigateProviderSignup,
  onSignOut,
  isProvider = false,
  isAdmin = false,
  currentView,
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

  const isAuthenticated = Boolean(user)

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
          <div className="nav-drawer-user-info">
            {isAuthenticated ? (
              <div className="nav-drawer-user-badge">
                <span className="nav-drawer-user-name">{user?.name}</span>
                <span className="nav-drawer-user-role">
                  {isAdmin ? 'Administrator' : isProvider ? 'Service Provider' : 'Customer'}
                </span>
              </div>
            ) : (
              <span className="nav-drawer-guest-label">Menu</span>
            )}
          </div>
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
            className={`nav-drawer-item ${currentView === 'discover' ? 'nav-drawer-item-active' : ''}`}
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

          {/* Protected Navigation — only shown when authenticated */}
          {isAuthenticated && (
            <button
              type="button"
              className={`nav-drawer-item ${currentView === 'bookings' ? 'nav-drawer-item-active' : ''}`}
              onClick={() => {
                onNavigateBookings()
                onClose()
              }}
            >
              <CalendarIcon className="nav-drawer-icon" />
              <span>My Bookings</span>
            </button>
          )}

          {isAuthenticated && isProvider && onNavigateProviderHub && (
            <button
              type="button"
              className={`nav-drawer-item ${
                currentView === 'provider-hub' ? 'nav-drawer-item-active' : ''
              }`}
              onClick={() => {
                onNavigateProviderHub()
                onClose()
              }}
            >
              <DashboardGridIcon className="nav-drawer-icon" />
              <span>Provider Hub</span>
            </button>
          )}

          {isAuthenticated && isAdmin && onNavigateAdminDashboard && (
            <button
              type="button"
              className={`nav-drawer-item ${
                currentView === 'admin-dashboard' ? 'nav-drawer-item-active' : ''
              }`}
              onClick={() => {
                onNavigateAdminDashboard()
                onClose()
              }}
            >
              <DashboardGridIcon className="nav-drawer-icon" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {isAuthenticated && isAdmin && onNavigateVideoModeration && (
            <button
              type="button"
              className={`nav-drawer-item ${
                currentView === 'video-moderation' ? 'nav-drawer-item-active' : ''
              }`}
              onClick={() => {
                onNavigateVideoModeration()
                onClose()
              }}
            >
              <VideoCameraIcon className="nav-drawer-icon" />
              <span>Video Moderation</span>
            </button>
          )}

          {isAuthenticated && isAdmin && onNavigateIdVerification && (
            <button
              type="button"
              className={`nav-drawer-item ${
                currentView === 'id-verification' ? 'nav-drawer-item-active' : ''
              }`}
              onClick={() => {
                onNavigateIdVerification()
                onClose()
              }}
            >
              <ShieldCheckIcon className="nav-drawer-icon" />
              <span>ID Verification</span>
            </button>
          )}

          <div className="nav-drawer-divider" />

          {/* Unauthenticated: Show Become a Provider and Sign In */}
          {!isAuthenticated && onNavigateProviderSignup && (
            <button
              type="button"
              className="nav-drawer-item"
              onClick={() => {
                onNavigateProviderSignup()
                onClose()
              }}
            >
              <DashboardGridIcon className="nav-drawer-icon" />
              <span>Become a Provider</span>
            </button>
          )}

          {!isAuthenticated && onSignIn && (
            <button
              type="button"
              className="nav-drawer-item nav-drawer-signin"
              onClick={() => {
                onSignIn()
                onClose()
              }}
            >
              <UserIcon className="nav-drawer-icon" />
              <span>Sign In</span>
            </button>
          )}

          {/* Authenticated: Show Sign Out action */}
          {isAuthenticated && (
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
          )}
        </nav>
      </aside>
    </div>
  )
}
