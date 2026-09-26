import { useState, useEffect } from 'react'
import type { MarketplaceItem, Service, VideoItem, Review } from '../../types/marketplace'
import {
  ChevronLeftIcon,
  VerifiedBadgeIcon,
  LocationPinIcon,
  StarIcon,
  PlayIcon,
} from '../common/Icons'

interface ProviderProfileProps {
  item: MarketplaceItem | null
  onBack: () => void
  onRequestService: (item: MarketplaceItem) => void
}

export function ProviderProfile({
  item,
  onBack,
  onRequestService,
}: ProviderProfileProps) {
  const [activeTab, setActiveTab] = useState<'videos' | 'about'>('videos')

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

  const { provider, service, video, rating } = item

  // Format category to singular if it ends with 's' (e.g. 'Makeup Artists' -> 'Makeup Artist')
  const categoryPill = provider.category.endsWith('s')
    ? provider.category.slice(0, -1)
    : provider.category

  // Fallback bio if not explicitly defined
  const bio =
    provider.bio ||
    `Professional ${categoryPill.toLowerCase()} based in ${provider.location}, delivering high-quality services tailored to your needs.`

  // Services list (prefer provider.services, fallback to item.service)
  const services: Service[] =
    provider.services && provider.services.length > 0
      ? provider.services
      : [service]

  // Featured videos list (prefer provider.featuredVideos, fallback to single item.video)
  const featuredVideos: VideoItem[] =
    provider.featuredVideos && provider.featuredVideos.length > 0
      ? provider.featuredVideos
      : [
          {
            ...video,
            title: service.name,
          },
        ]

  // Reviews list
  const reviews: Review[] = provider.reviews || []

  // Review count
  const reviewCount = provider.reviewCount ?? 126

  return (
    <div
      className="provider-profile-screen"
      role="region"
      aria-label={`${provider.businessName} Profile`}
    >
      <div className="provider-profile-container">
        {/* Top Back Navigation */}
        <header className="provider-profile-top-nav">
          <button
            type="button"
            className="profile-back-btn"
            onClick={onBack}
            aria-label="Back"
          >
            <ChevronLeftIcon />
          </button>
        </header>

        {/* Scrollable Profile Body */}
        <div className="provider-profile-scroll-body">
          {/* Profile Header Details */}
          <div className="provider-profile-header">
            {/* Avatar Circle */}
            <div className="profile-large-avatar" aria-hidden="true">
              {provider.initials}
            </div>

            {/* Provider Name + Verified Badge */}
            <div className="profile-name-row">
              <h1 className="profile-business-name">{provider.businessName}</h1>
              {provider.isVerified && (
                <span className="profile-verified-badge" title="Verified Provider">
                  <VerifiedBadgeIcon />
                </span>
              )}
            </div>

            {/* Category Pill */}
            <div className="profile-category-pill">{categoryPill}</div>

            {/* Metadata Row: Location · Rating · Review Count */}
            <div className="profile-meta-row">
              <div className="profile-meta-item profile-location">
                <LocationPinIcon />
                <span>{provider.location}</span>
              </div>
              <div
                className="profile-meta-item profile-rating"
                aria-label={`Rating: ${rating.toFixed(1)} out of 5 stars`}
              >
                <StarIcon className="profile-star-gold" />
                <span className="profile-rating-score">{rating.toFixed(1)}</span>
              </div>
              <span className="profile-review-count">{reviewCount} reviews</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="profile-tabs-bar" role="tablist" aria-label="Provider profile tabs">
            <button
              type="button"
              role="tab"
              id="tab-featured-videos"
              aria-selected={activeTab === 'videos'}
              aria-controls="panel-featured-videos"
              className={`profile-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <span>Featured Videos</span>
              {activeTab === 'videos' && <div className="profile-tab-indicator" />}
            </button>

            <button
              type="button"
              role="tab"
              id="tab-about"
              aria-selected={activeTab === 'about'}
              aria-controls="panel-about"
              className={`profile-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
              onClick={() => setActiveTab('about')}
            >
              <span>About</span>
              {activeTab === 'about' && <div className="profile-tab-indicator" />}
            </button>
          </div>

          {/* Tab Content */}
          <div className="profile-tab-content">
            {/* 1. Featured Videos Tab */}
            {activeTab === 'videos' && (
              <div
                id="panel-featured-videos"
                role="tabpanel"
                aria-labelledby="tab-featured-videos"
                className="profile-videos-grid"
              >
                {featuredVideos.map((vid) => (
                  <article key={vid.id} className="profile-video-card">
                    {/* Media Preview Box */}
                    <div className="profile-video-media">
                      <div className="profile-video-play-overlay" aria-hidden="true">
                        <PlayIcon />
                      </div>

                      {/* Video Bottom Info Overlay */}
                      <div className="profile-video-bottom-overlay">
                        {vid.title && (
                          <span className="profile-video-title-pill">{vid.title}</span>
                        )}
                        <span className="profile-video-duration-pill">{vid.duration}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* 2. About Tab */}
            {activeTab === 'about' && (
              <div
                id="panel-about"
                role="tabpanel"
                aria-labelledby="tab-about"
                className="profile-about-panel"
              >
                {/* Bio paragraph */}
                <p className="profile-bio-text">{bio}</p>

                {/* Services Section */}
                <section className="profile-services-section" aria-label="Services offered">
                  <h2 className="profile-section-title">Services</h2>
                  <div className="profile-services-list">
                    {services.map((srv, idx) => (
                      <div key={srv.id || idx} className="profile-service-row">
                        <span className="profile-service-name">{srv.name}</span>
                        <span className="profile-service-price">{srv.priceDisplay}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Reviews Section */}
                <section className="profile-reviews-section" aria-label="Customer reviews">
                  <h2 className="profile-section-title">Reviews</h2>
                  {reviews.length > 0 ? (
                    <div className="profile-reviews-list">
                      {reviews.map((rev) => (
                        <article key={rev.id} className="profile-review-card">
                          <div className="profile-review-header">
                            <div className="profile-reviewer-info">
                              {rev.authorAvatarUrl ? (
                                <img
                                  src={rev.authorAvatarUrl}
                                  alt=""
                                  className="profile-reviewer-avatar"
                                />
                              ) : (
                                <div className="profile-reviewer-avatar-placeholder" aria-hidden="true">
                                  {rev.authorName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)}
                                </div>
                              )}
                              <span className="profile-reviewer-name">{rev.authorName}</span>
                            </div>

                            {/* 5-Star Rating Row */}
                            <div
                              className="profile-review-stars"
                              aria-label={`Rated ${rev.rating} out of 5 stars`}
                            >
                              {[1, 2, 3, 4, 5].map((starIdx) => (
                                <StarIcon
                                  key={starIdx}
                                  className={
                                    starIdx <= rev.rating
                                      ? 'profile-star-gold'
                                      : 'profile-star-gray'
                                  }
                                />
                              ))}
                            </div>
                          </div>

                          {/* Quote */}
                          <p className="profile-review-comment">{rev.comment}</p>

                          {/* Date */}
                          <div className="profile-review-date">{rev.date}</div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="profile-no-reviews">No reviews yet.</p>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom CTA */}
        <div className="provider-profile-fixed-cta">
          <button
            type="button"
            className="profile-request-btn"
            onClick={() => onRequestService(item)}
          >
            Request Service
          </button>
        </div>
      </div>
    </div>
  )
}
