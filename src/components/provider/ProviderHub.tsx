import {
  MenuLinesIcon,
  UploadTrayIcon,
  ChatIcon,
  VideoCameraIcon,
  StarIcon,
  UserIcon,
  InfoCircleIcon,
  CheckIcon,
} from '../common/Icons'
import type { User } from '../../types/marketplace'

export interface BookingStats {
  pending: number
  inProgress: number
  completed: number
  declined: number
}

interface ProviderHubProps {
  user?: User | null
  providerInitials?: string
  isVerified?: boolean
  isNewProvider?: boolean
  bookingStats?: BookingStats
  onMenuClick: () => void
  onUploadVideo?: () => void
  onViewRequests?: () => void
  onManageVideos?: () => void
  onCustomerReviews?: () => void
  onViewProfile?: () => void
}

function getInitials(name?: string, fallback = 'AB'): string {
  if (!name || !name.trim()) return fallback
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ProviderHub({
  user,
  providerInitials,
  isVerified = false,
  isNewProvider,
  bookingStats = { pending: 2, inProgress: 1, completed: 6, declined: 1 },
  onMenuClick,
  onUploadVideo,
  onViewRequests,
  onManageVideos,
  onCustomerReviews,
  onViewProfile,
}: ProviderHubProps) {
  // Determine whether to display State A (New Provider) or State B (Active Provider)
  const isNew =
    isNewProvider !== undefined
      ? isNewProvider
      : !isVerified &&
        bookingStats.pending === 0 &&
        bookingStats.inProgress === 0 &&
        bookingStats.completed === 0 &&
        bookingStats.declined === 0

  const initials = providerInitials || getInitials(user?.name)

  return (
    <div className="provider-hub-screen">
      <div className="provider-hub-container">
        {/* Header Bar */}
        <header className="provider-hub-header">
          <h1 className="provider-hub-title">Provider Hub</h1>
          <div className="provider-hub-header-actions">
            <div className="provider-hub-avatar" aria-label={`Provider ${initials}`}>
              {initials}
            </div>
            <button
              type="button"
              className="provider-hub-menu-btn"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
            >
              <MenuLinesIcon />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="provider-hub-content">
          {isNew ? (
            /* ============================================================ */
            /* STATE A — NEW PROVIDER (matches "Provider Hub New.pdf")       */
            /* ============================================================ */
            <>
              {/* Upload your first video banner */}
              <section className="provider-card provider-upload-card" aria-labelledby="upload-video-title">
                <h2 id="upload-video-title" className="provider-card-heading">
                  Upload your first video
                </h2>
                <p className="provider-card-subtext">
                  Customers discover providers through video. Upload one to start appearing in the Discover feed.
                </p>
                <button
                  type="button"
                  className="provider-primary-btn"
                  onClick={onUploadVideo}
                >
                  Upload Now
                </button>
              </section>

              {/* New Requests empty state */}
              <section className="provider-card provider-empty-requests-card" aria-labelledby="new-requests-empty-title">
                <h2 id="new-requests-empty-title" className="provider-card-heading">
                  New Requests
                </h2>
                <p className="provider-card-subtext">
                  No requests yet — once customers discover your videos, requests will appear here.
                </p>
              </section>

              {/* Profile Verification card (Under Review) */}
              <section className="provider-card provider-verification-card" aria-labelledby="verification-title-new">
                <div className="provider-verification-header">
                  <h2 id="verification-title-new" className="provider-card-heading">
                    Profile Verification
                  </h2>
                  <span className="provider-badge-review">
                    <InfoCircleIcon className="provider-badge-icon" />
                    <span>Under Review</span>
                  </span>
                </div>
                <p className="provider-card-subtext">
                  Your ID and selfie are pending admin review and approval.
                </p>
              </section>
            </>
          ) : (
            /* ============================================================ */
            /* STATE B — ACTIVE PROVIDER (matches "Provider Hub - Pending Requests.pdf") */
            /* ============================================================ */
            <>
              {/* New Requests Blue Alert Banner */}
              <section className="provider-requests-banner" aria-labelledby="active-requests-title">
                <span className="provider-requests-banner-tag">NEW REQUESTS</span>
                <h2 id="active-requests-title" className="provider-requests-banner-title">
                  {bookingStats.pending} requests awaiting your response
                </h2>
                <p className="provider-requests-banner-subtext">
                  Customers are waiting to hear back from you.
                </p>
                <button
                  type="button"
                  className="provider-banner-btn"
                  onClick={onViewRequests}
                >
                  View Requests
                </button>
              </section>

              {/* Statistics Grid */}
              <section className="provider-stats-grid" aria-label="Request statistics">
                <div className="provider-stat-card stat-pending">
                  <span className="provider-stat-value">{bookingStats.pending}</span>
                  <span className="provider-stat-label">Pending</span>
                </div>
                <div className="provider-stat-card stat-inprogress">
                  <span className="provider-stat-value">{bookingStats.inProgress}</span>
                  <span className="provider-stat-label">In Progress</span>
                </div>
                <div className="provider-stat-card stat-completed">
                  <span className="provider-stat-value">{bookingStats.completed}</span>
                  <span className="provider-stat-label">Completed</span>
                </div>
                <div className="provider-stat-card stat-declined">
                  <span className="provider-stat-value">{bookingStats.declined}</span>
                  <span className="provider-stat-label">Declined</span>
                </div>
              </section>

              {/* Profile Verification card (Verified) */}
              <section className="provider-card provider-verification-card" aria-labelledby="verification-title-active">
                <div className="provider-verification-header">
                  <h2 id="verification-title-active" className="provider-card-heading">
                    Profile Verification
                  </h2>
                  <span className="provider-badge-verified">
                    <CheckIcon className="provider-badge-icon" />
                    <span>Verified</span>
                  </span>
                </div>
                <p className="provider-card-subtext">
                  Your ID and selfie have been reviewed and approved.
                </p>
              </section>
            </>
          )}

          {/* Quick Actions (Present in both New and Active states) */}
          <section className="provider-quick-actions" aria-labelledby="quick-actions-title">
            <h3 id="quick-actions-title" className="provider-section-title">
              QUICK ACTIONS
            </h3>
            <div className="provider-quick-actions-grid">
              <button
                type="button"
                className="provider-action-card"
                onClick={onUploadVideo}
              >
                <UploadTrayIcon className="provider-action-icon" />
                <span className="provider-action-label">Upload Video</span>
              </button>

              <button
                type="button"
                className="provider-action-card"
                onClick={onViewRequests}
              >
                <ChatIcon className="provider-action-icon" />
                <span className="provider-action-label">View Requests</span>
              </button>

              <button
                type="button"
                className="provider-action-card"
                onClick={onManageVideos}
              >
                <VideoCameraIcon className="provider-action-icon" />
                <span className="provider-action-label">Manage Videos</span>
              </button>

              <button
                type="button"
                className="provider-action-card"
                onClick={onCustomerReviews}
              >
                <StarIcon className="provider-action-icon" />
                <span className="provider-action-label">Customer Reviews</span>
              </button>

              <button
                type="button"
                className="provider-action-card provider-action-card-wide"
                onClick={onViewProfile}
              >
                <UserIcon className="provider-action-icon" />
                <span className="provider-action-label">View Profile</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
