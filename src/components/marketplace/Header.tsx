import { DiscoverLogo, UserIcon } from '../common/Icons'

interface HeaderProps {
  onAuthClick?: () => void
}

export function Header({ onAuthClick }: HeaderProps) {
  return (
    <header className="marketplace-header">
      <div className="brand-group">
        <DiscoverLogo />
        <span className="brand-name">Discover</span>
      </div>

      <button
        type="button"
        className="auth-action-btn"
        onClick={onAuthClick}
        aria-label="Sign up or Sign in"
      >
        <UserIcon />
        <span>Sign up/Sign in</span>
      </button>
    </header>
  )
}
