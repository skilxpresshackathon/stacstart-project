import type { MarketplaceItem } from '../../types/marketplace'
import { VerifiedBadgeIcon, PlayIcon, StarIcon, LocationPinIcon } from '../common/Icons'

interface SearchResultCardProps {
  item: MarketplaceItem
  onClick: (item: MarketplaceItem) => void
}

export function SearchResultCard({ item, onClick }: SearchResultCardProps) {
  return (
    <article
      className="search-result-card"
      onClick={() => onClick(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick(item)
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`${item.service.name} by ${item.provider.businessName}`}
    >
      <div className="search-result-media">
        <div className="search-result-placeholder">
          <div className="search-result-play-overlay">
            <PlayIcon className="search-result-play-icon" />
          </div>
          <span className="search-result-duration">{item.video.duration}</span>
        </div>
      </div>

      <div className="search-result-content">
        <div className="search-result-header">
          <div className="search-result-provider-row">
            <span className="search-result-business">{item.provider.businessName}</span>
            {item.provider.isVerified && (
              <VerifiedBadgeIcon className="search-result-verified" />
            )}
          </div>
          <h3 className="search-result-service-name">{item.service.name}</h3>
          <div className="search-result-location">
            <LocationPinIcon className="search-result-pin-icon" />
            <span>{item.provider.location}</span>
          </div>
        </div>

        <div className="search-result-footer">
          <span className="search-result-price">{item.service.priceDisplay}</span>
          <div className="search-result-rating">
            <StarIcon className="search-result-star-icon" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
