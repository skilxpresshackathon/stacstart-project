import { CheckIcon, MenuLinesIcon } from '../common/Icons'
import { DEFAULT_ADMIN_METRICS, type AdminPlatformMetrics } from '../../lib/mockData'

interface AdminDashboardProps {
  metrics?: AdminPlatformMetrics
  onMenuClick: () => void
  onReviewVideos: () => void
  onReviewId: () => void
}

export function AdminDashboard({
  metrics = DEFAULT_ADMIN_METRICS,
  onMenuClick,
  onReviewVideos,
  onReviewId,
}: AdminDashboardProps) {
  return (
    <div className="admin-dashboard-screen">
      <div className="admin-dashboard-container">
        {/* Blue Header Bar */}
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-header-left">
            <div className="admin-dashboard-badge" aria-hidden="true">
              <CheckIcon className="admin-dashboard-badge-icon" />
            </div>
            <h1 className="admin-dashboard-title">Admin Dashboard</h1>
          </div>
          <button
            type="button"
            className="admin-dashboard-menu-btn"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <MenuLinesIcon className="admin-dashboard-menu-icon" />
          </button>
        </header>

        {/* Dashboard Content */}
        <main className="admin-dashboard-content">
          {/* Section: Platform Metrics */}
          <section className="admin-dashboard-section" aria-labelledby="platform-metrics-heading">
            <h2 id="platform-metrics-heading" className="admin-section-heading">
              PLATFORM METRICS
            </h2>
            <div className="admin-metrics-grid">
              <div className="admin-metric-card metric-total-users">
                <span className="admin-metric-label">TOTAL USERS</span>
                <span className="admin-metric-value">{metrics.totalUsers.toLocaleString()}</span>
              </div>
              <div className="admin-metric-card metric-verified-users">
                <span className="admin-metric-label">VERIFIED USERS</span>
                <span className="admin-metric-value">{metrics.verifiedUsers.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Section: Video Moderation */}
          <section className="admin-dashboard-section" aria-labelledby="video-moderation-heading">
            <h2 id="video-moderation-heading" className="admin-section-heading">
              VIDEO MODERATION
            </h2>
            <div className="admin-action-card">
              <h3 className="admin-card-title">Videos awaiting review</h3>
              <p className="admin-card-desc">
                Providers have submitted videos that need your review before they can appear in Discover.
              </p>
              <button
                type="button"
                className="admin-action-btn admin-review-videos-btn"
                onClick={onReviewVideos}
              >
                Review Videos
              </button>
            </div>
          </section>

          {/* Section: ID Verification */}
          <section className="admin-dashboard-section" aria-labelledby="id-verification-heading">
            <h2 id="id-verification-heading" className="admin-section-heading">
              ID VERIFICATION
            </h2>
            <div className="admin-action-card">
              <h3 className="admin-card-title">Pending ID review</h3>
              <p className="admin-card-desc">
                Providers have submitted IDs that need your review to be approved.
              </p>
              <button
                type="button"
                className="admin-action-btn admin-review-id-btn"
                onClick={onReviewId}
              >
                Review ID
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
