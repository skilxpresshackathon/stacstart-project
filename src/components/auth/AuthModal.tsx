import { useState, useEffect } from 'react'
import { CloseIcon, EyeIcon, EyeOffIcon } from '../common/Icons'
import { supabase } from '../../lib/supabase'
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
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
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
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.')
        return
      }
    }

    try {
      setIsLoading(true)

      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        })

        if (error) {
          setIsLoading(false)
          setErrorMessage(
            error.message === 'Invalid login credentials'
              ? 'Invalid email or password.'
              : error.message
          )
          return
        }

        if (!data.user) {
          setIsLoading(false)
          setErrorMessage('Unable to sign in. Please try again.')
          return
        }

        // Fetch application profile to obtain the verified role
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, email, role')
          .eq('id', data.user.id)
          .maybeSingle()

        const appUser: User = {
          id: data.user.id,
          name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0],
          email: data.user.email || email.trim(),
          role: (profile?.role as 'customer' | 'provider' | 'admin') || 'customer',
        }

        setIsLoading(false)
        onAuthSuccess(appUser)
        onClose()
      } else {
        // Customer Registration
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: name.trim(),
              role: 'customer',
            },
          },
        })

        if (error) {
          setIsLoading(false)
          setErrorMessage(error.message)
          return
        }

        if (!data.user) {
          setIsLoading(false)
          setErrorMessage('Registration failed. Please try again.')
          return
        }

        // Determine user role (defaults to customer)
        let userRole: 'customer' | 'provider' | 'admin' = 'customer'
        if (data.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle()
          if (profile?.role) {
            userRole = profile.role as 'customer' | 'provider' | 'admin'
          }
        }

        const appUser: User = {
          id: data.user.id,
          name: name.trim(),
          email: email.trim(),
          role: userRole,
        }

        setIsLoading(false)
        onAuthSuccess(appUser)
        onClose()
      }
    } catch (err: unknown) {
      setIsLoading(false)
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(message)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address to reset your password.')
      return
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
      if (error) {
        setErrorMessage(error.message)
      } else {
        setInfoMessage('Password reset instructions have been sent to your email.')
      }
    } catch {
      setErrorMessage('Failed to send password reset email. Please try again.')
    }
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

          <button type="submit" className="auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
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
