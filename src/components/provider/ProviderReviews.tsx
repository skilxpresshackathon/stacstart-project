import { useState, useEffect } from 'react'
import { ChevronLeftIcon, MenuLinesIcon, StarIcon } from '../common/Icons'
import { fetchProviderReviews } from '../../lib/data/reviews'
import type { Review, User } from '../../types/marketplace'

interface ProviderReviewsProps {
  user?: User | null
  providerId?: string
  providerName?: string
  onBack: () => void
  onMenuClick: () => void
}

export function ProviderReviews({
  user,
  providerId,
  providerName,
  onBack,
  onMenuClick,
}: ProviderReviewsProps) {
  const targetId = providerId || user?.id
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(targetId))

  useEffect(() => {
    let isMounted = true

    if (!targetId) {
      return
    }

    fetchProviderReviews(targetId)
      .then((data) => {
        if (isMounted) {
          setReviews(data)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn('[ProviderReviews] Error loading reviews:', err)
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [targetId])

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      : 0

  const getInitials = (name?: string) => {
    if (!name) return 'VC'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="provider-reviews-screen">
      <div className="provider-reviews-container">
        {/* Header Bar */}
        <header className="provider-reviews-header">
          <div className="provider-reviews-header-left">
            <button
              type="button"
              className="provider-reviews-back-btn"
              onClick={onBack}
              aria-label="Back to Provider Hub"
            >
              <ChevronLeftIcon className="provider-reviews-back-icon" />
            </button>
            <div className="provider-reviews-title-group">
              <h1 className="provider-reviews-title">Customer Reviews</h1>
              {providerName && (
                <span className="provider-reviews-subtitle">{providerName}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            className="provider-reviews-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <MenuLinesIcon className="provider-reviews-menu-icon" />
          </button>
        </header>

        {/* Content Area */}
        <main className="provider-reviews-content">
          {/* Summary Card */}
          <div className="provider-reviews-summary-card">
            <div className="summary-rating-main">
              <span className="summary-rating-num">
                {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
              </span>
              <div className="summary-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={`summary-star-icon ${
                      star <= Math.round(averageRating || 5) ? 'filled' : 'empty'
                    }`}
                  />
                ))}
              </div>
              <span className="summary-count">
                Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </span>
            </div>
            <p className="summary-subtext">
              Real reviews submitted by verified clients upon completed bookings.
            </p>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="provider-reviews-loading">
              <div className="spinner" />
              <p>Loading your reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="provider-reviews-empty">
              <div className="empty-star-badge">
                <StarIcon className="empty-star-icon" />
              </div>
              <h2>No Reviews Yet</h2>
              <p>
                When clients complete bookings with you, their feedback and ratings will appear
                here.
              </p>
            </div>
          ) : (
            <div className="provider-reviews-list" role="list">
              {reviews.map((rev) => (
                <article key={rev.id} className="provider-review-card" role="listitem">
                  <div className="review-card-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {getInitials(rev.authorName)}
                      </div>
                      <div>
                        <h2 className="reviewer-name">{rev.authorName}</h2>
                        <span className="review-date">{rev.date}</span>
                      </div>
                    </div>
                    <div className="review-rating-badge">
                      <StarIcon className="badge-star" />
                      <span>{rev.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="review-comment-text">{rev.comment}</p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
