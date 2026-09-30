import { DiscoverLogo, UserIcon, MenuLinesIcon } from '../common/Icons'
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!user && (
          <button
            type="button"
            className="auth-action-btn"
            onClick={onAuthClick}
            aria-label="Sign in"
          >
            <UserIcon />
            <span>Sign In</span>
          </button>
        )}
        <button
          type="button"
          className="header-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <MenuLinesIcon />
        </button>
      </div>
    </header>
  )
}
