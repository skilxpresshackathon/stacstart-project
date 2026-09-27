import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  ChevronLeftIcon,
  DiscoverLogo,
  EyeIcon,
  EyeOffIcon,
  LocationPinIcon,
  UploadTrayIcon,
  InfoCircleIcon,
  UserIcon,
} from '../common/Icons'
import type { User } from '../../types/marketplace'

interface ProviderSignupFlowProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (user: User) => void
  onSwitchToSignIn: () => void
}

export function ProviderSignupFlow({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToSignIn,
}: ProviderSignupFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1 State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 2 State
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')
  const [services, setServices] = useState('')
  const [location, setLocation] = useState('')

  // Step 3 State
  const [nin, setNin] = useState('')
  const [ninFile, setNinFile] = useState<File | null>(null)
  const [ninPreviewUrl, setNinPreviewUrl] = useState<string | null>(null)
  const [selfieFile, setSelfieFile] = useState<File | null>(null)
  const [selfiePreviewUrl, setSelfiePreviewUrl] = useState<string | null>(null)

  const [errorMessage, setErrorMessage] = useState('')

  const ninFileInputRef = useRef<HTMLInputElement>(null)
  const selfieFileInputRef = useRef<HTMLInputElement>(null)

  const ninPreviewRef = useRef<string | null>(null)
  const selfiePreviewRef = useRef<string | null>(null)

  useEffect(() => {
    ninPreviewRef.current = ninPreviewUrl
    selfiePreviewRef.current = selfiePreviewUrl
  }, [ninPreviewUrl, selfiePreviewUrl])

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (ninPreviewRef.current) URL.revokeObjectURL(ninPreviewRef.current)
      if (selfiePreviewRef.current) URL.revokeObjectURL(selfiePreviewRef.current)
    }
  }, [])

  if (!isOpen) return null

  // Step Navigation & Validation
  const handleStep1Submit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (!phone.trim() || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid phone number (e.g. 0810-000-0000).')
      return
    }

    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep2Submit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!businessName.trim()) {
      setErrorMessage('Please enter your business name.')
      return
    }

    if (!category.trim()) {
      setErrorMessage('Please enter your service category.')
      return
    }

    if (!services.trim()) {
      setErrorMessage('Please list at least one service you offer.')
      return
    }

    if (!location.trim()) {
      setErrorMessage('Please enter your business location.')
      return
    }

    setStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStep3Submit = (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanNin = nin.trim().replace(/\D/g, '')
    if (cleanNin.length !== 11) {
      setErrorMessage('NIN must be exactly 11 digits.')
      return
    }

    if (!ninFile) {
      setErrorMessage('Please upload or take a photo of your NIN document.')
      return
    }

    if (!selfieFile) {
      setErrorMessage('Please capture or upload a selfie for verification.')
      return
    }

    // Mock provider user creation
    const newProviderUser: User = {
      id: `prov-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim(),
      role: 'provider',
    }

    onSuccess(newProviderUser)
  }

  const handleBack = () => {
    setErrorMessage('')
    if (step === 3) {
      setStep(2)
    } else if (step === 2) {
      setStep(1)
    } else {
      onClose()
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // File Upload Handlers
  const handleNinFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (ninPreviewUrl) URL.revokeObjectURL(ninPreviewUrl)
      setNinFile(file)
      setNinPreviewUrl(URL.createObjectURL(file))
      setErrorMessage('')
    }
  }

  const handleSelfieFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (selfiePreviewUrl) URL.revokeObjectURL(selfiePreviewUrl)
      setSelfieFile(file)
      setSelfiePreviewUrl(URL.createObjectURL(file))
      setErrorMessage('')
    }
  }

  return (
    <div className="provider-signup-screen">
      <div className="provider-signup-container">
        {/* Top Header */}
        <header className="provider-signup-header">
          <button
            type="button"
            className="provider-signup-back-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ChevronLeftIcon />
          </button>
          <span className="provider-signup-step-label">Step {step} of 3</span>
        </header>

        {/* 3-Segment Progress Indicator */}
        <div
          className="provider-progress-bar"
          role="progressbar"
          aria-valuenow={step}
          aria-valuemin={1}
          aria-valuemax={3}
          aria-label={`Step ${step} of 3`}
        >
          <div className={`progress-segment ${step >= 1 ? 'active' : ''}`} />
          <div className={`progress-segment ${step >= 2 ? 'active' : ''}`} />
          <div className={`progress-segment ${step >= 3 ? 'active' : ''}`} />
        </div>

        {/* Brand & Subtitle */}
        <div className="provider-signup-branding">
          <div className="provider-brand-row">
            <DiscoverLogo className="provider-brand-logo" />
            <span className="provider-brand-title">Discover</span>
          </div>
          <p className="provider-signup-subtitle">
            {step === 1 && 'Create your provider account in 3 steps.'}
            {step === 2 &&
              'Complete this form to set up your provider account and start listing your services.'}
            {step === 3 &&
              'We require a valid NIN ID card and a quick selfie to confirm the ID belongs to you. This helps keep the marketplace trustworthy for customers.'}
          </p>
        </div>

        {/* Section Title with bottom hairline */}
        <div className="provider-section-title-wrap">
          <h2 className="provider-section-title">
            {step === 1 && 'Account Information'}
            {step === 2 && 'Business Information'}
            {step === 3 && 'Identity Verification'}
          </h2>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="provider-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {/* ================= STEP 1 ================= */}
        {step === 1 && (
          <form className="auth-form" onSubmit={handleStep1Submit} noValidate>
            <div className="form-group">
              <label htmlFor="ps-full-name" className="form-label">
                Full Name
              </label>
              <input
                id="ps-full-name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ps-email" className="form-label">
                Email Address
              </label>
              <input
                id="ps-email"
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
              <label htmlFor="ps-phone" className="form-label">
                Phone Number
              </label>
              <input
                id="ps-phone"
                type="tel"
                className="form-input"
                placeholder="0810-000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ps-password" className="form-label">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="ps-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input password-input"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div className="form-group">
              <label htmlFor="ps-confirm-password" className="form-label">
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="ps-confirm-password"
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

            <button type="submit" className="provider-primary-btn">
              Continue
            </button>

            <div className="provider-bottom-switch">
              Already have an account?{' '}
              <button
                type="button"
                className="provider-switch-link"
                onClick={onSwitchToSignIn}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 2 ================= */}
        {step === 2 && (
          <form className="auth-form" onSubmit={handleStep2Submit} noValidate>
            <div className="form-group">
              <label htmlFor="ps-biz-name" className="form-label">
                Business Name
              </label>
              <input
                id="ps-biz-name"
                type="text"
                className="form-input"
                placeholder="Enter your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ps-category" className="form-label">
                Service Category
              </label>
              <input
                id="ps-category"
                type="text"
                className="form-input"
                placeholder="Hairdressing, Electrician,..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ps-services" className="form-label">
                List Services
              </label>
              <textarea
                id="ps-services"
                rows={4}
                className="form-textarea provider-textarea-override"
                placeholder="Microlocs twisting, Solar panel installation..."
                value={services}
                onChange={(e) => setServices(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="ps-location" className="form-label">
                Location
              </label>
              <div className="provider-location-input-wrapper">
                <LocationPinIcon className="provider-location-pin" />
                <input
                  id="ps-location"
                  type="text"
                  className="form-input location-field"
                  placeholder="Ikeja, Lagos..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="provider-primary-btn">
              Continue
            </button>
          </form>
        )}

        {/* ================= STEP 3 ================= */}
        {step === 3 && (
          <form className="auth-form" onSubmit={handleStep3Submit} noValidate>
            <div className="form-group">
              <label htmlFor="ps-nin" className="form-label">
                NIN Number
              </label>
              <input
                id="ps-nin"
                type="text"
                maxLength={11}
                inputMode="numeric"
                className="form-input"
                placeholder="Enter 11-digit NIN number"
                value={nin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 11)
                  setNin(val)
                }}
                required
              />
            </div>

            {/* NIN Document Upload Box */}
            <div className="form-group">
              <span className="form-label">NIN Document</span>
              <input
                ref={ninFileInputRef}
                type="file"
                accept="image/*"
                className="provider-hidden-file-input"
                onChange={handleNinFileChange}
                aria-label="Upload NIN Document"
              />

              <div
                className={`provider-upload-card ${ninFile ? 'has-file' : ''}`}
                onClick={() => ninFileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    ninFileInputRef.current?.click()
                  }
                }}
                aria-label="Tap to upload or take a photo of your NIN document"
              >
                {ninPreviewUrl ? (
                  <div className="provider-upload-preview">
                    <img
                      src={ninPreviewUrl}
                      alt="NIN Document Preview"
                      className="provider-doc-preview-img"
                    />
                    <div className="provider-upload-change-tag">Tap to change document</div>
                  </div>
                ) : (
                  <>
                    <UploadTrayIcon className="provider-upload-icon" />
                    <span className="provider-upload-main-text">
                      Tap to upload or take a photo
                    </span>
                    <span className="provider-upload-subtext">
                      A valid ID is required for provider verification.
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Selfie Verification Box */}
            <div className="form-group">
              <span className="form-label">Selfie Verification</span>
              <input
                ref={selfieFileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="provider-hidden-file-input"
                onChange={handleSelfieFileChange}
                aria-label="Capture or upload selfie"
              />

              <div className="provider-selfie-card">
                {selfiePreviewUrl ? (
                  <div className="provider-selfie-preview-wrap">
                    <img
                      src={selfiePreviewUrl}
                      alt="Selfie Preview"
                      className="provider-selfie-preview-img"
                    />
                    <button
                      type="button"
                      className="provider-selfie-action-btn"
                      onClick={() => selfieFileInputRef.current?.click()}
                    >
                      Retake Selfie
                    </button>
                  </div>
                ) : (
                  <>
                    <div
                      className="provider-selfie-circle-dashed"
                      onClick={() => selfieFileInputRef.current?.click()}
                    >
                      <UserIcon className="provider-selfie-placeholder-icon" />
                    </div>
                    <p className="provider-selfie-helper-text">
                      Center your face in frame, and ensure good lighting.
                    </p>
                    <button
                      type="button"
                      className="provider-selfie-action-btn"
                      onClick={() => selfieFileInputRef.current?.click()}
                    >
                      Take Selfie
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Review Warning Callout */}
            <div className="provider-warning-callout" role="note">
              <InfoCircleIcon className="provider-warning-icon" />
              <p className="provider-warning-text">
                Review every section above before submitting, as any incomplete or mismatched
                information will delay your verification.
              </p>
            </div>

            <button type="submit" className="provider-primary-btn">
              Create Provider Account
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
