import { useState } from 'react'
import {
  ChevronLeftIcon,
  MenuLinesIcon,
  VideoCameraIcon,
  UploadTrayIcon,
  PlayIcon,
  CheckIcon,
  ClockIcon,
  CloseIcon,
} from '../common/Icons'
import {
  type ProviderVideoItem,
  type ProviderVideoStatus,
} from '../../lib/mockData'

export type VideoFilterTab = 'All' | 'Approved' | 'Under Review' | 'Rejected'

interface ProviderVideosProps {
  videos?: ProviderVideoItem[]
  onBack: () => void
  onMenuClick: () => void
  onUploadVideo: () => void
}

export function ProviderVideos({
  videos = [],
  onBack,
  onMenuClick,
  onUploadVideo,
}: ProviderVideosProps) {
  const [selectedTab, setSelectedTab] = useState<VideoFilterTab>('All')

  // If there are no videos at all, display the empty state from Task 1
  if (videos.length === 0) {
    return (
      <div className="provider-videos-screen">
        <div className="provider-videos-container">
          <header className="provider-videos-header">
            <div className="provider-videos-header-left">
              <button
                type="button"
                className="provider-videos-back-btn"
                onClick={onBack}
                aria-label="Back to Provider Hub"
              >
                <ChevronLeftIcon />
              </button>
              <h1 className="provider-videos-title">Videos</h1>
            </div>

            <button
              type="button"
              className="provider-videos-menu-btn"
              onClick={onMenuClick}
              aria-label="Open navigation menu"
            >
              <MenuLinesIcon />
            </button>
          </header>

          <main className="provider-videos-content">
            <div className="provider-videos-empty-card">
              <div className="provider-videos-circle" aria-hidden="true">
                <VideoCameraIcon className="provider-videos-camera-icon" />
              </div>
              <h2 className="provider-videos-heading">No videos yet</h2>
              <p className="provider-videos-subtext">
                Upload a video to start appearing in Discover.
              </p>
              <button
                type="button"
                className="provider-videos-upload-btn"
                onClick={onUploadVideo}
              >
                <UploadTrayIcon className="provider-videos-upload-icon" />
                <span>Upload Video</span>
              </button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  // Filter videos according to selected tab
  const filteredVideos = videos.filter((vid) => {
    if (selectedTab === 'All') return true
    if (selectedTab === 'Approved') return vid.status === 'approved'
    if (selectedTab === 'Under Review') return vid.status === 'under_review'
    if (selectedTab === 'Rejected') return vid.status === 'rejected'
    return true
  })

  const renderStatusBadge = (status: ProviderVideoStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="manage-video-status status-approved">
            <CheckIcon className="status-badge-icon" />
            <span>Approved</span>
          </span>
        )
      case 'under_review':
        return (
          <span className="manage-video-status status-under-review">
            <ClockIcon className="status-badge-icon" />
            <span>Under Review</span>
          </span>
        )
      case 'rejected':
        return (
          <span className="manage-video-status status-rejected">
            <CloseIcon className="status-badge-icon" />
            <span>Rejected</span>
          </span>
        )
    }
  }

  return (
    <div className="provider-videos-screen">
      <div className="provider-videos-container">
        {/* Top Header Bar */}
        <header className="provider-videos-header">
          <div className="provider-videos-header-left">
            <button
              type="button"
              className="provider-videos-back-btn"
              onClick={onBack}
              aria-label="Back to Provider Hub"
            >
              <ChevronLeftIcon />
            </button>
            <h1 className="provider-videos-title">Videos</h1>
          </div>

          <button
            type="button"
            className="provider-videos-menu-btn"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <MenuLinesIcon />
          </button>
        </header>

        {/* Status Filter Tabs */}
        <nav className="manage-videos-tabs" aria-label="Video status filter">
          {(['All', 'Approved', 'Under Review', 'Rejected'] as VideoFilterTab[]).map((tab) => {
            const isActive = selectedTab === tab
            return (
              <button
                key={tab}
                type="button"
                className={`manage-videos-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            )
          })}
        </nav>

        {/* Video Grid Content */}
        <main className="manage-videos-content">
          {filteredVideos.length === 0 ? (
            <div className="manage-videos-empty-filter">
              <p>No videos with &quot;{selectedTab}&quot; status.</p>
            </div>
          ) : (
            <div className="manage-videos-grid" role="list">
              {filteredVideos.map((video) => (
                <div key={video.id} className="manage-video-card" role="listitem">
                  {/* Status Badge at Top Left */}
                  <div className="manage-video-card-top">
                    {renderStatusBadge(video.status)}
                  </div>

                  {/* Centered Circular Play Button */}
                  <div className="manage-video-play-wrap" aria-hidden="true">
                    <div className="manage-video-play-btn">
                      <PlayIcon className="manage-video-play-icon" />
                    </div>
                  </div>

                  {/* Title Pill at Bottom Left */}
                  <div className="manage-video-card-bottom">
                    <span className="manage-video-title-pill" title={video.title}>
                      {video.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Full-width Upload Video Action Button */}
          <div className="manage-videos-bottom-action">
            <button
              type="button"
              className="provider-videos-upload-btn"
              onClick={onUploadVideo}
            >
              <UploadTrayIcon className="provider-videos-upload-icon" />
              <span>Upload Video</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
