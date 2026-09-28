import { useState, useEffect } from 'react'
import type { BookingRequest, Review } from '../../types/marketplace'
import { CloseIcon, StarIcon } from '../common/Icons'

interface ReviewBookingModalProps {
  booking: BookingRequest | null
  existingReview?: Review | null
  isOpen: boolean
  onClose: () => void
  onSubmitReview: (bookingId: string, rating: number, comment?: string) => Promise<boolean>
}

export function ReviewBookingModal({
  booking,
  existingReview,
  isOpen,
  onClose,
  onSubmitReview,
}: ReviewBookingModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !booking) return null

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden={!isOpen}>
      <ReviewModalContent
        key={`${booking.id}-${existingReview ? 'view' : 'new'}`}
        booking={booking}
        existingReview={existingReview}
        onClose={onClose}
        onSubmitReview={onSubmitReview}
      />
    </div>
  )
}

interface ReviewModalContentProps {
  booking: BookingRequest
  existingReview?: Review | null
  onClose: () => void
  onSubmitReview: (bookingId: string, rating: number, comment?: string) => Promise<boolean>
}

function ReviewModalContent({
  booking,
  existingReview,
  onClose,
  onSubmitReview,
}: ReviewModalContentProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating ?? 5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isAlreadyReviewed = Boolean(existingReview)
  const currentRating = hoverRating !== null ? hoverRating : rating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isAlreadyReviewed) {
      onClose()
      return
    }

    if (rating < 1 || rating > 5) {
      setErrorMessage('Please select a rating between 1 and 5 stars.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    const success = await onSubmitReview(booking.id, rating, comment.trim() || undefined)

    setIsSubmitting(false)
    if (success) {
      onClose()
    }
  }

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Excellent! 5.0'
      case 4:
        return 'Great! 4.0'
      case 3:
        return 'Average. 3.0'
      case 2:
        return 'Poor. 2.0'
      case 1:
        return 'Terrible. 1.0'
      default:
        return `${score}.0`
    }
  }

  return (
    <div
      className="booking-modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="modal-close-btn"
        onClick={onClose}
        aria-label="Close review modal"
      >
        <CloseIcon />
      </button>

      <div className="booking-modal-header">
        <h2 id="review-modal-title" className="booking-modal-title">
          {isAlreadyReviewed ? 'Booking Review' : 'Rate & Review'}
        </h2>
        <p className="booking-modal-subtitle">
          {isAlreadyReviewed
            ? `You previously reviewed ${booking.provider.businessName}`
            : `Share your experience with ${booking.provider.businessName}`}
        </p>
      </div>

      {/* Selected Service Card Summary */}
      <div className="booking-service-summary">
        <div>
          <h4 className="summary-service-name">{booking.service.name}</h4>
          <span className="summary-service-category">{booking.provider.businessName}</span>
        </div>
        <span className="booking-status-pill status-completed">Completed</span>
      </div>

      {errorMessage && (
        <div className="auth-error-banner" role="alert">
          {errorMessage}
        </div>
      )}

      <form className="booking-form" onSubmit={handleSubmit}>
        {/* Interactive Star Rating Selection */}
        <div className="form-group" style={{ textAlign: 'center' }}>
          <label className="form-label" style={{ textAlign: 'center' }}>
            {isAlreadyReviewed ? 'Your Rating' : 'Your Rating (Tap to select)'}
          </label>
          <div
            className="review-modal-stars-wrap"
            role="radiogroup"
            aria-label="Star Rating from 1 to 5"
          >
            {[1, 2, 3, 4, 5].map((starValue) => {
              const isFilled = starValue <= currentRating
              return (
                <button
                  key={starValue}
                  type="button"
                  disabled={isAlreadyReviewed || isSubmitting}
                  className="review-modal-star-btn"
                  onClick={() => {
                    setRating(starValue)
                    setErrorMessage(null)
                  }}
                  onMouseEnter={() => !isAlreadyReviewed && setHoverRating(starValue)}
                  onMouseLeave={() => !isAlreadyReviewed && setHoverRating(null)}
                  aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                  aria-checked={rating === starValue}
                  role="radio"
                >
                  <StarIcon
                    className={`review-modal-star-icon ${isFilled ? 'filled' : ''}`}
                  />
                </button>
              )
            })}
          </div>
          <div className="review-rating-label">{getRatingLabel(currentRating)}</div>
        </div>

        {/* Comment Textarea */}
        <div className="form-group">
          <label htmlFor="review-comment" className="form-label">
            Feedback / Comment {isAlreadyReviewed ? '' : '(Optional)'}
          </label>
          <textarea
            id="review-comment"
            className="form-textarea"
            rows={3}
            placeholder={
              isAlreadyReviewed
                ? 'No comment provided.'
                : 'Write a few words about the service quality, punctuality, etc...'
            }
            value={comment}
            disabled={isAlreadyReviewed || isSubmitting}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* Modal Action Buttons */}
        <div className="booking-modal-actions" style={{ display: 'flex', gap: '10px' }}>
          {isAlreadyReviewed ? (
            <button
              type="button"
              className="btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
