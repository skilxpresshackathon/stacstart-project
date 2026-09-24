import { DiscoverLogo, UserIcon, MoreMenuIcon } from '../common/Icons'
import type { User } from '../../types/marketplace'

interface HeaderProps {
  user?: User | null
  onAuthClick?: () => void
  onMenuClick?: () => void
}

export function Header({ user, onAuthClick, onMenuClick }: HeaderProps) {
  return (
    <header className="marketplace-header">
      <div className="brand-group">
        <DiscoverLogo />
        <span className="brand-name">Discover</span>
      </div>

      {user ? (
        <button
          type="button"
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <MoreMenuIcon />
        </button>
      ) : (
        <button
          type="button"
          className="auth-action-btn"
          onClick={onAuthClick}
          aria-label="Sign up or Sign in"
        >
          <UserIcon />
          <span>Sign up/Sign in</span>
        </button>
      )}
    </header>
  )
}
