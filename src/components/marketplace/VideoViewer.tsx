import { useState, useEffect } from 'react'
import type { MarketplaceItem } from '../../types/marketplace'
import {
  ChevronLeftIcon,
  VerifiedBadgeIcon,
  LocationPinIcon,
  PlayIcon,
  StarIcon,
} from '../common/Icons'
import { getVideoPlaybackUrl } from '../../lib/data/videos'

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
  const [activeUrl, setActiveUrl] = useState<string | null>(item?.video?.videoUrl || null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  useEffect(() => {
    let isMounted = true

    if (!item?.video?.videoUrl && item?.video?.storagePath) {
      getVideoPlaybackUrl(item.video.storagePath).then((url) => {
        if (!isMounted) return
        if (url) {
          setActiveUrl(url)
          setLoadError(false)
        } else {
          setLoadError(true)
        }
      }).catch(() => {
        if (isMounted) {
          setLoadError(true)
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [item?.video?.videoUrl, item?.video?.storagePath])

  if (!item) return null

  const { provider, service, rating } = item
  const description =
    service.description ||
    `High quality professional service delivered by ${provider.businessName}. Book now to send a direct request.`

  const handleVideoError = () => {
    if (item.video?.storagePath && !loadError) {
      // Attempt refreshing signed URL once
      getVideoPlaybackUrl(item.video.storagePath).then((freshUrl) => {
        if (freshUrl && freshUrl !== activeUrl) {
          setActiveUrl(freshUrl)
        } else {
          setLoadError(true)
        }
      })
    } else {
      setLoadError(true)
    }
  }

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
          {activeUrl && !loadError ? (
            <video
              src={activeUrl.includes('#') ? activeUrl : `${activeUrl}#t=0.001`}
              className="video-viewer-player"
              controls
              playsInline
              preload="metadata"
              poster={item.video?.thumbnailUrl}
              onError={handleVideoError}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="video-viewer-fallback">
              <button
                type="button"
                className="video-viewer-play-btn"
                aria-label={`Play video for ${service.name}`}
              >
                <PlayIcon />
              </button>
              {loadError && (
                <p className="video-viewer-fallback-text">
                  Video preview temporarily unavailable.
                </p>
              )}
            </div>
          )}
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
              aria-label={rating > 0 ? `Rating: ${rating.toFixed(1)} out of 5 stars` : 'New Provider'}
            >
              <StarIcon />
              <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
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
