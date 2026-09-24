import { useState, useEffect } from 'react'
import { CloseIcon, EyeIcon, EyeOffIcon } from '../common/Icons'
import type { User } from '../../types/marketplace'

export type AuthMode = 'login' | 'register'

interface AuthModalProps {
  isOpen: boolean
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onClose: () => void
  onAuthSuccess: (user: User) => void
  onProviderSignupClick?: () => void
}

export function AuthModal({
  isOpen,
  mode,
  onModeChange,
  onClose,
  onAuthSuccess,
  onProviderSignupClick,
}: AuthModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields.')
      return
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Please enter your name.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.')
        return
      }
    }

    // Mock client-side authentication for Day 3
    const user: User = {
      id: `usr-${Date.now()}`,
      name: mode === 'register' ? name.trim() : email.split('@')[0] || 'Customer',
      email: email.trim(),
      role: 'customer',
    }

    onAuthSuccess(user)
    onClose()
  }

  const handleForgotPassword = () => {
    setInfoMessage('Password reset link will be sent to your email once backend is connected.')
  }

  const switchMode = (newMode: AuthMode) => {
    setErrorMessage('')
    setInfoMessage('')
    onModeChange(newMode)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden={!isOpen}>
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Close Button */}
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>

        {/* Modal Header */}
        <div className="auth-modal-header">
          <h2 id="auth-modal-title" className="auth-modal-title">
            {mode === 'login' ? 'Sign In' : 'Create An Account'}
          </h2>
          <p className="auth-modal-subtitle">
            {mode === 'login'
              ? 'Sign in to send a service request.'
              : 'Sign up to send a service request.'}
          </p>
        </div>

        {errorMessage && <div className="auth-error-banner">{errorMessage}</div>}
        {infoMessage && <div className="auth-info-banner">{infoMessage}</div>}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-name" className="form-label">
                Name
              </label>
              <input
                id="auth-name"
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              className="form-input"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password" className="form-label">
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {mode === 'login' && (
            <div className="forgot-password-row">
              <button
                type="button"
                className="forgot-password-link"
                onClick={handleForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="auth-confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input password-input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Modal Footer Switchers */}
        <div className="auth-modal-footer">
          {mode === 'login' ? (
            <p className="auth-switch-text">
              Don’t have an account?{' '}
              <button
                type="button"
                className="auth-switch-link"
                onClick={() => switchMode('register')}
              >
                Sign Up
              </button>
            </p>
          ) : (
            <>
              <p className="auth-switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => switchMode('login')}
                >
                  Sign In
                </button>
              </p>
              <p className="auth-provider-switch-text">
                Sign up as a service provider?{' '}
                <button
                  type="button"
                  className="auth-provider-link"
                  onClick={onProviderSignupClick}
                >
                  Click here
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
