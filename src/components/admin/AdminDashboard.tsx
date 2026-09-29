import { useState } from 'react'
import { CheckIcon, MenuLinesIcon, ChevronRightIcon } from '../common/Icons'
import {
  DEFAULT_ADMIN_METRICS,
  DEFAULT_SITE_VISITS,
  type AdminPlatformMetrics,
  type SiteVisitDataPoint
} from '../../lib/mockData'

interface AdminDashboardProps {
  metrics?: AdminPlatformMetrics
  siteVisits?: SiteVisitDataPoint[]
  onMenuClick: () => void
  onReviewVideos: () => void
  onReviewId: () => void
}

export function AdminDashboard({
  metrics = DEFAULT_ADMIN_METRICS,
  siteVisits = DEFAULT_SITE_VISITS,
  onMenuClick,
  onReviewVideos,
  onReviewId,
}: AdminDashboardProps) {
  // Default selected day is Thursday (index 3) matching the designer reference
  const defaultSelectedIdx = siteVisits.findIndex(s => s.selected) >= 0
    ? siteVisits.findIndex(s => s.selected)
    : 3
  const [selectedIdx, setSelectedIdx] = useState(defaultSelectedIdx)

  // Chart coordinate mapping
  // Y-axis: 0 to 500. SVG viewBox is 350x200
  // Top gridline (500) at y = 20, Bottom gridline (0) at y = 150
  // Range: 130px for 500 units => y = 150 - (val / 500) * 130
  const yValues = [500, 400, 300, 200, 100, 0]
  const getY = (val: number) => 150 - (val / 500) * 130

  // 7 points evenly spaced from x = 52 to x = 320 (delta = 44.67)
  const xPoints = [52, 97, 141, 186, 231, 275, 320]

  // Compute (x, y) for all site visit points
  const points = siteVisits.map((item, idx) => ({
    x: xPoints[idx] ?? 52 + idx * 45,
    y: getY(item.visits),
    ...item
  }))

  // Smooth cubic Bezier spline through the points matching reference curvature
  const getSmoothSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`
    let d = `M ${pts[0].x},${pts[0].y}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]

      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6

      d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    }
    return d
  }

  const pathD = getSmoothSplinePath(points)
  const activePoint = points[selectedIdx] ?? points[3]

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
          {/* Section 1: Platform Metrics */}
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

          {/* Section 2: Site Visits Card */}
          <section className="admin-dashboard-section" aria-label="Site visits statistics">
            <div className="admin-site-visits-card">
              <div className="admin-site-visits-header">
                <h3 className="admin-site-visits-title">Site Visits</h3>
                <div className="admin-site-visits-period" role="button" tabIndex={0}>
                  <span>Last 7 Days</span>
                  <ChevronRightIcon className="admin-site-visits-chevron" />
                </div>
              </div>

              {/* Minimal Line Chart */}
              <div className="admin-site-visits-chart-wrap">
                <svg
                  className="admin-site-visits-svg"
                  viewBox="0 0 350 190"
                  aria-label="Site visits chart over the last 7 days"
                >
                  {/* Horizontal Gridlines & Y-Axis Labels */}
                  {yValues.map((val) => {
                    const y = getY(val)
                    return (
                      <g key={val} className="admin-chart-gridline-group">
                        <text
                          x="24"
                          y={y + 4}
                          textAnchor="end"
                          className="admin-chart-y-label"
                        >
                          {val}
                        </text>
                        <line
                          x1="36"
                          y1={y}
                          x2="335"
                          y2={y}
                          className="admin-chart-gridline"
                        />
                      </g>
                    )
                  })}

                  {/* Vertical Dotted Guide Line for Selected Day */}
                  {activePoint && (
                    <line
                      x1={activePoint.x}
                      y1={activePoint.y}
                      x2={activePoint.x}
                      y2={getY(0)}
                      className="admin-chart-active-guide"
                    />
                  )}

                  {/* Smooth Orange Curve */}
                  <path
                    d={pathD}
                    fill="none"
                    className="admin-chart-curve"
                  />

                  {/* Non-selected day data points */}
                  {points.map((pt, idx) => {
                    if (idx === selectedIdx) return null
                    return (
                      <circle
                        key={pt.day}
                        cx={pt.x}
                        cy={pt.y}
                        r="3"
                        className="admin-chart-dot"
                        onClick={() => setSelectedIdx(idx)}
                        style={{ cursor: 'pointer' }}
                      />
                    )
                  })}

                  {/* Active Highlighted Dot and Tooltip Value */}
                  {activePoint && (
                    <g className="admin-chart-active-group">
                      <text
                        x={activePoint.x}
                        y={activePoint.y - 14}
                        textAnchor="middle"
                        className="admin-chart-active-val"
                      >
                        {activePoint.visits}
                      </text>
                      <circle
                        cx={activePoint.x}
                        cy={activePoint.y}
                        r="5.5"
                        className="admin-chart-active-dot"
                      />
                    </g>
                  )}

                  {/* X-Axis Day Labels */}
                  {points.map((pt, idx) => (
                    <text
                      key={pt.day}
                      x={pt.x}
                      y="176"
                      textAnchor="middle"
                      className={`admin-chart-x-label ${idx === selectedIdx ? 'is-selected' : ''}`}
                      onClick={() => setSelectedIdx(idx)}
                      style={{ cursor: 'pointer' }}
                    >
                      {pt.day}
                    </text>
                  ))}
                </svg>
              </div>
            </div>
          </section>

          {/* Section 3: Video Moderation */}
          <section className="admin-dashboard-section" aria-labelledby="video-moderation-heading">
            <h2 id="video-moderation-heading" className="admin-section-heading">
              VIDEO MODERATION
            </h2>
            <div className="admin-action-card">
              <h3 className="admin-card-title admin-video-mod-title">Videos awaiting review</h3>
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

          {/* Section 4: ID Verification */}
          <section className="admin-dashboard-section" aria-labelledby="id-verification-heading">
            <h2 id="id-verification-heading" className="admin-section-heading">
              ID VERIFICATION
            </h2>
            <div className="admin-action-card">
              <h3 className="admin-card-title admin-id-verif-title">Pending ID review</h3>
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
