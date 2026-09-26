import { useEffect } from 'react'
import type { MarketplaceItem } from '../../types/marketplace'
import {
  ChevronLeftIcon,
  VerifiedBadgeIcon,
  LocationPinIcon,
  PlayIcon,
  StarIcon,
} from '../common/Icons'

interface VideoViewerProps {
  item: MarketplaceItem | null
  onBack: () => void
  onRequestService: (item: MarketplaceItem) => void
  onProviderClick?: (item: MarketplaceItem) => void
}

export function VideoViewer({
  item,
  onBack,
  onRequestService,
  onProviderClick,
}: VideoViewerProps) {
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

  const { provider, service, rating } = item
  const description =
    service.description ||
    `High quality professional service delivered by ${provider.businessName}. Book now to send a direct request.`

  return (
    <div
      className="video-viewer-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Video viewer for ${service.name}`}
    >
      <div className="video-viewer-frame">
        {/* Top-left back button */}
        <button
          type="button"
          className="video-viewer-back-btn"
          onClick={onBack}
          aria-label="Back"
        >
          <ChevronLeftIcon />
        </button>

        {/* Center Media Play Area */}
        <div className="video-viewer-media-stage">
          <button
            type="button"
            className="video-viewer-play-btn"
            aria-label={`Play video for ${service.name}`}
          >
            <PlayIcon />
          </button>
        </div>

        {/* Bottom Overlay Content */}
        <div className="video-viewer-bottom-overlay">
          {/* Provider row */}
          <button
            type="button"
            className="video-viewer-provider-btn"
            onClick={() => onProviderClick?.(item)}
            aria-label={`View ${provider.businessName} profile`}
          >
            <div className="video-viewer-avatar" aria-hidden="true">
              {provider.initials}
            </div>
            <span className="video-viewer-provider-name">{provider.businessName}</span>
            {provider.isVerified && (
              <span className="video-viewer-verified" title="Verified Provider">
                <VerifiedBadgeIcon />
              </span>
            )}
          </button>

          {/* Service Title */}
          <h1 className="video-viewer-service-title">{service.name}</h1>

          {/* Service Description */}
          <p className="video-viewer-description">{description}</p>

          {/* Meta line: Location · Price · Rating */}
          <div className="video-viewer-meta-row">
            <div className="video-viewer-meta-item video-viewer-location">
              <LocationPinIcon />
              <span>{provider.location}</span>
            </div>
            <span className="video-viewer-meta-dot" aria-hidden="true">
              ·
            </span>
            <span className="video-viewer-meta-item video-viewer-price">
              {service.priceDisplay}
            </span>
            <span className="video-viewer-meta-dot" aria-hidden="true">
              ·
            </span>
            <div
              className="video-viewer-meta-item video-viewer-rating"
              aria-label={`Rating: ${rating} out of 5 stars`}
            >
              <StarIcon />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Full-width white CTA button */}
          <button
            type="button"
            className="video-viewer-cta-btn"
            onClick={() => onRequestService(item)}
          >
            Request Service
          </button>

          {/* Home indicator bar (mobile-accurate) */}
          <div className="video-viewer-home-indicator" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
