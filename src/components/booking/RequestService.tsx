import { useState, useEffect } from 'react'
import type { MarketplaceItem, BookingRequest, User, Service } from '../../types/marketplace'
import {
  ChevronLeftIcon,
  ChevronDownIcon,
  VerifiedBadgeIcon,
  LocationPinIcon,
  CalendarIcon,
  ClockIcon,
} from '../common/Icons'
import { LOCATIONS } from '../../lib/mockData'

interface RequestServiceProps {
  item: MarketplaceItem | null
  user: User | null
  onBack: () => void
  onSubmitBooking: (booking: BookingRequest) => void
  onProviderClick?: () => void
}

export function RequestService({
  item,
  user,
  onBack,
  onSubmitBooking,
  onProviderClick,
}: RequestServiceProps) {
  // Service selection
  const [selectedService, setSelectedService] = useState<Service | null>(item?.service || null)

  // Location selection / input
  const [location, setLocation] = useState(item?.provider.location || '')

  // Description input
  const [description, setDescription] = useState('')

  // Preferred Date & Time
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')

  // Validation / Error state
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  if (!item) return null

  const { provider } = item
  const availableLocations = LOCATIONS.filter((loc) => loc !== 'All')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Please sign in to submit a service request.')
      return
    }

    if (!selectedService) {
      setError('Please select a service.')
      return
    }

    if (!location.trim() || !description.trim()) {
      setError('Please provide a service location and description.')
      return
    }

    const newBooking: BookingRequest = {
      id: `req-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      provider: provider,
      service: selectedService,
      location: location.trim(),
      description: description.trim(),
      preferredDate: preferredDate || undefined,
      preferredTime: preferredTime || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    onSubmitBooking(newBooking)
  }

  return (
    <div
      className="request-service-view"
      role="region"
      aria-label="Request Service"
    >
      <div className="request-service-container">
        {/* Header with Back Arrow and Title (No X button) */}
        <header className="request-service-header">
          <button
            type="button"
            className="request-service-back-btn"
            onClick={onBack}
            aria-label="Back to video"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="request-service-title">Request Service</h1>
        </header>

        {/* Provider section */}
        <button
          type="button"
          className="request-service-provider-btn"
          onClick={() => onProviderClick?.()}
          aria-label={`View ${provider.businessName} profile`}
        >
          <div className="request-service-avatar" aria-hidden="true">
            {provider.initials}
          </div>
          <div className="request-service-provider-info">
            <span className="request-service-provider-name">{provider.businessName}</span>
            {provider.isVerified && (
              <span className="request-service-verified" title="Verified Provider">
                <VerifiedBadgeIcon />
              </span>
            )}
          </div>
        </button>

        {error && (
          <div className="request-service-error-banner" role="alert">
            {error}
          </div>
        )}

        {/* Form fields */}
        <form className="request-service-form" onSubmit={handleSubmit}>
          {/* 1. Service Selector */}
          <div className="request-service-form-group">
            <label htmlFor="service-select" className="request-service-label">
              Service
            </label>
            <div className="request-service-input-wrapper">
              <select
                id="service-select"
                className="request-service-select"
                value={selectedService?.id || ''}
                onChange={(e) => {
                  if (e.target.value === item.service.id) {
                    setSelectedService(item.service)
                  }
                }}
              >
                <option value={item.service.id}>
                  {item.service.name} ({item.service.priceDisplay})
                </option>
              </select>
              <ChevronDownIcon className="request-service-select-chevron" />
            </div>
          </div>

          {/* 2. Location Selector */}
          <div className="request-service-form-group">
            <label htmlFor="location-select" className="request-service-label">
              Location
            </label>
            <div className="request-service-input-wrapper with-icon">
              <LocationPinIcon className="request-service-field-icon" />
              <select
                id="location-select"
                className="request-service-select with-icon-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select location
                </option>
                {/* Include provider location if not in LOCATIONS */}
                {!availableLocations.includes(provider.location) && (
                  <option value={provider.location}>{provider.location}</option>
                )}
                {availableLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="request-service-select-chevron" />
            </div>
          </div>

          {/* 3. Description */}
          <div className="request-service-form-group">
            <label htmlFor="service-description" className="request-service-label">
              Description
            </label>
            <textarea
              id="service-description"
              className="request-service-textarea"
              rows={4}
              placeholder="Describe what you need from this service..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* 4. Preferred Date */}
          <div className="request-service-form-group">
            <label htmlFor="preferred-date" className="request-service-label">
              Preferred Date
            </label>
            <div className="request-service-input-wrapper with-icon">
              <CalendarIcon className="request-service-field-icon" />
              <input
                id="preferred-date"
                type="date"
                className="request-service-input with-icon-input"
                placeholder="Select date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
          </div>

          {/* 5. Preferred Time */}
          <div className="request-service-form-group">
            <label htmlFor="preferred-time" className="request-service-label">
              Preferred Time
            </label>
            <div className="request-service-input-wrapper with-icon">
              <ClockIcon className="request-service-field-icon" />
              <select
                id="preferred-time"
                className="request-service-select with-icon-input"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              >
                <option value="">Select time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
              <ChevronDownIcon className="request-service-select-chevron" />
            </div>
          </div>

          {/* 6. Primary Action Button */}
          <button type="submit" className="request-service-submit-btn">
            Request Service
          </button>

          {/* 7. Explanatory Disclaimer */}
          <div className="request-service-disclaimer">
            <p>This sends a request — it doesn't book or confirm anything yet.</p>
            <p>You can track its status in My Bookings.</p>
          </div>
        </form>
      </div>
    </div>
  )
}
