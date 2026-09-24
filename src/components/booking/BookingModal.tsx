import { useState, useEffect } from 'react'
import type { MarketplaceItem, BookingRequest, User } from '../../types/marketplace'
import { CloseIcon } from '../common/Icons'

interface BookingModalProps {
  item: MarketplaceItem | null
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSubmitBooking: (booking: BookingRequest) => void
}

export function BookingModal({
  item,
  user,
  isOpen,
  onClose,
  onSubmitBooking,
}: BookingModalProps) {
  const [location, setLocation] = useState(item?.provider.location || '')
  const [description, setDescription] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !item || !user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!location.trim() || !description.trim()) {
      setError('Please provide a service location and description.')
      return
    }

    const newBooking: BookingRequest = {
      id: `req-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      provider: item.provider,
      service: item.service,
      location: location.trim(),
      description: description.trim(),
      preferredDate: preferredDate || undefined,
      preferredTime: preferredTime || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    onSubmitBooking(newBooking)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden={!isOpen}>
      <div
        className="booking-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close booking modal"
        >
          <CloseIcon />
        </button>

        <div className="booking-modal-header">
          <h2 id="booking-modal-title" className="booking-modal-title">
            Request Service
          </h2>
          <p className="booking-modal-subtitle">
            Send a service request to <strong>{item.provider.businessName}</strong>
          </p>
        </div>

        {/* Selected Service Card Summary */}
        <div className="booking-service-summary">
          <div>
            <h4 className="summary-service-name">{item.service.name}</h4>
            <span className="summary-service-category">{item.provider.category}</span>
          </div>
          <span className="summary-service-price">{item.service.priceDisplay}</span>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form className="booking-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="booking-location" className="form-label">
              Service Location
            </label>
            <input
              id="booking-location"
              type="text"
              className="form-input"
              placeholder="e.g. Ikeja, Lagos"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="booking-description" className="form-label">
              Request Details / Description
            </label>
            <textarea
              id="booking-description"
              className="form-textarea"
              rows={3}
              placeholder="Describe what you need help with..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="booking-datetime-grid">
            <div className="form-group">
              <label htmlFor="booking-date" className="form-label">
                Preferred Date
              </label>
              <input
                id="booking-date"
                type="date"
                className="form-input"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="booking-time" className="form-label">
                Preferred Time
              </label>
              <input
                id="booking-time"
                type="text"
                className="form-input"
                placeholder="e.g. 10:00 AM"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
              />
            </div>
          </div>

          <div className="booking-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
