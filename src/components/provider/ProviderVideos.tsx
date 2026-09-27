import { ChevronLeftIcon, MenuLinesIcon, VideoCameraIcon, UploadTrayIcon } from '../common/Icons'

interface ProviderVideosProps {
  onBack: () => void
  onMenuClick: () => void
  onUploadVideo: () => void
}

export function ProviderVideos({ onBack, onMenuClick, onUploadVideo }: ProviderVideosProps) {
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

        {/* Main Empty State Content Area */}
        <main className="provider-videos-content">
          <div className="provider-videos-empty-card">
            {/* Centered Camera Icon Circle */}
            <div className="provider-videos-circle" aria-hidden="true">
              <VideoCameraIcon className="provider-videos-camera-icon" />
            </div>

            {/* Heading & Supporting Text */}
            <h2 className="provider-videos-heading">No videos yet</h2>
            <p className="provider-videos-subtext">
              Upload a video to start appearing in Discover.
            </p>

            {/* Full-width Upload Video Action Button */}
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
