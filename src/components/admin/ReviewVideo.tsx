import { ChevronLeftIcon, PlayIcon, CheckIcon, CloseIcon } from '../common/Icons'
import { type ReviewVideoItem, DEFAULT_REVIEW_VIDEO_ITEM } from '../../lib/mockData'


interface ReviewVideoProps {
  item?: ReviewVideoItem
  onBack: () => void
  onApprove: (item: ReviewVideoItem) => void
  onReject: (item: ReviewVideoItem) => void
}

export function ReviewVideo({
  item = DEFAULT_REVIEW_VIDEO_ITEM,
  onBack,
  onApprove,
  onReject,
}: ReviewVideoProps) {
  return (
    <div className="review-video-screen">
      <div className="review-video-container">
        {/* Blue Top Header Bar */}
        <header className="review-video-header">
          <button
            type="button"
            className="review-video-back-btn"
            onClick={onBack}
            aria-label="Back"
          >
            <ChevronLeftIcon className="review-video-back-icon" />
          </button>
          <h1 className="review-video-title">Review Video</h1>
        </header>

        {/* Video Preview Center Area */}
        <main className="review-video-preview-area">
          <div className="review-video-play-wrap" aria-label="Play video preview">
            <button
              type="button"
              className="review-video-play-btn"
              aria-label="Play preview video"
            >
              <PlayIcon className="review-video-play-icon" />
            </button>
          </div>
        </main>

        {/* Bottom Information & Action Panel */}
        <footer className="review-video-bottom-panel">
          {/* Top Pill / Drag Handle Indicator */}
          <div className="review-video-drag-handle" aria-hidden="true" />

          {/* Provider and Service Information Rows */}
          <div className="review-video-info-table">
            <div className="review-video-info-row">
              <span className="review-video-info-label">Provider</span>
              <span className="review-video-info-value">{item.providerName}</span>
            </div>
            <div className="review-video-info-divider" />
            <div className="review-video-info-row">
              <span className="review-video-info-label">Service</span>
              <span className="review-video-info-value">{item.serviceName}</span>
            </div>
            <div className="review-video-info-divider" />
          </div>

          {/* Action Buttons: Approve Video & Reject Video */}
          <div className="review-video-actions">
            <button
              type="button"
              className="review-video-action-btn review-video-approve-btn"
              onClick={() => onApprove(item)}
            >
              <CheckIcon className="review-video-btn-icon" />
              <span>Approve Video</span>
            </button>

            <button
              type="button"
              className="review-video-action-btn review-video-reject-btn"
              onClick={() => onReject(item)}
            >
              <CloseIcon className="review-video-btn-icon" />
              <span>Reject Video</span>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
