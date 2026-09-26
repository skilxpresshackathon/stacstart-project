import type { MarketplaceItem } from '../../types/marketplace'
import {
  VerifiedBadgeIcon,
  LocationPinIcon,
  PlayIcon,
  StarIcon,
} from '../common/Icons'

interface ProviderCardProps {
  item: MarketplaceItem
  onCardClick?: (item: MarketplaceItem) => void
  onProviderClick?: (item: MarketplaceItem) => void
}

export function ProviderCard({ item, onCardClick, onProviderClick }: ProviderCardProps) {
  const { provider, service, video, rating } = item

  const handleProviderClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onProviderClick?.(item)
  }

  return (
    <article
      className="provider-card"
      onClick={() => onCardClick?.(item)}
      aria-labelledby={`service-title-${item.id}`}
    >
      {/* Provider Header */}
      <header className="card-header">
        <button
          type="button"
          className="card-provider-identity-btn"
          onClick={handleProviderClick}
          aria-label={`View ${provider.businessName} profile`}
        >
          <div className="provider-avatar" aria-hidden="true">
            {provider.initials}
          </div>
          <div className="provider-info">
            <div className="provider-name-row">
              <span className="provider-name">{provider.businessName}</span>
              {provider.isVerified && (
                <span className="verified-badge-wrapper" title="Verified Provider">
                  <VerifiedBadgeIcon />
                </span>
              )}
            </div>
            <div className="provider-location">
              <LocationPinIcon />
              <span>{provider.location}</span>
            </div>
          </div>
        </button>
      </header>

      {/* Video Preview Area */}
      <div className="video-preview-container" tabIndex={0} role="region" aria-label={`Video preview for ${service.name}`}>
        {/* Duration badge */}
        <div className="video-duration-badge" aria-label={`Duration: ${video.duration}`}>
          {video.duration}
        </div>

        {/* Center Play Button Overlay */}
        <button
          type="button"
          className="play-button-overlay"
          aria-label={`Play preview video for ${service.name}`}
        >
          <PlayIcon />
        </button>

        {/* Bottom Video Scrubber Line */}
        <div className="video-scrubber-track" aria-hidden="true">
          <div className="video-scrubber-progress" />
        </div>
      </div>

      {/* Service & Price / Rating Footer */}
      <footer className="card-footer">
        <h3 id={`service-title-${item.id}`} className="service-title">
          {service.name}
        </h3>
        <div className="service-meta-row">
          <span className="service-price">{service.priceDisplay}</span>
          <div className="service-rating" aria-label={`Rating: ${rating} out of 5 stars`}>
            <StarIcon />
            <span className="rating-value">{rating.toFixed(1)}</span>
          </div>
        </div>
      </footer>
    </article>
  )
}
