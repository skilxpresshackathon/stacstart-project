import { useEffect } from 'react'
import type { MarketplaceItem } from '../../types/marketplace'
import {
  CloseIcon,
  BackArrowIcon,
  VerifiedBadgeIcon,
  LocationPinIcon,
  PlayIcon,
  StarIcon,
} from '../common/Icons'

interface ProviderDetailModalProps {
  item: MarketplaceItem | null
  isOpen: boolean
  onClose: () => void
  onRequestService: (item: MarketplaceItem) => void
}

export function ProviderDetailModal({
  item,
  isOpen,
  onClose,
  onRequestService,
}: ProviderDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !item) return null

  const { provider, service, video, rating } = item

  return (
    <div className="modal-backdrop" onClick={onClose} aria-hidden={!isOpen}>
      <article
        className="provider-detail-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`detail-service-${item.id}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Navigation Bar */}
        <div className="detail-top-bar">
          <button
            type="button"
            className="detail-back-btn"
            onClick={onClose}
            aria-label="Back to Discover"
          >
            <BackArrowIcon />
            <span>Back</span>
          </button>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close detail modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Provider Profile Header */}
        <header className="detail-provider-header">
          <div className="provider-avatar" aria-hidden="true">
            {provider.initials}
          </div>
          <div className="provider-info">
            <div className="provider-name-row">
              <h2 className="provider-name">{provider.businessName}</h2>
              {provider.isVerified && (
                <span className="verified-badge-wrapper" title="Verified Provider">
                  <VerifiedBadgeIcon />
                </span>
              )}
            </div>
            <div className="provider-location">
              <LocationPinIcon />
              <span>{provider.location}</span>
              <span className="category-tag-dot">•</span>
              <span className="provider-category-tag">{provider.category}</span>
            </div>
          </div>
        </header>

        {/* Video Preview Container */}
        <div className="video-preview-container detail-video-container" tabIndex={0}>
          <div className="video-duration-badge" aria-label={`Duration: ${video.duration}`}>
            {video.duration}
          </div>
          <button
            type="button"
            className="play-button-overlay"
            aria-label={`Play preview video for ${service.name}`}
          >
            <PlayIcon />
          </button>
          <div className="video-scrubber-track" aria-hidden="true">
            <div className="video-scrubber-progress" />
          </div>
        </div>

        {/* Service Details & Pricing */}
        <div className="detail-service-body">
          <h3 id={`detail-service-${item.id}`} className="service-title detail-service-title">
            {service.name}
          </h3>

          <div className="service-meta-row detail-meta-row">
            <span className="service-price detail-price">{service.priceDisplay}</span>
            <div className="service-rating" aria-label={`Rating: ${rating} out of 5 stars`}>
              <StarIcon />
              <span className="rating-value">{rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="detail-description">
            High quality professional service delivered by {provider.businessName}. Book now to send a direct request.
          </p>

          <button
            type="button"
            className="request-service-btn"
            onClick={() => onRequestService(item)}
          >
            Request Service
          </button>
        </div>
      </article>
    </div>
  )
}
