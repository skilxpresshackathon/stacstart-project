import { useState } from 'react'
import { ChevronLeftIcon, CloseIcon } from '../common/Icons'
import {
  type ReviewVideoItem,
  type RejectionReason,
  DEFAULT_REVIEW_VIDEO_ITEM,
  REJECTION_REASONS,
} from '../../lib/mockData'

interface RejectVideoProps {
  item?: ReviewVideoItem
  onBack: () => void
  onCancel: () => void
  onConfirmReject: (item: ReviewVideoItem, reason: RejectionReason) => void
}

export function RejectVideo({
  item = DEFAULT_REVIEW_VIDEO_ITEM,
  onBack,
  onCancel,
  onConfirmReject,
}: RejectVideoProps) {
  const [selectedReason, setSelectedReason] = useState<RejectionReason>('Violates Platform Guidelines')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleRejectClick = () => {
    if (!selectedReason) {
      setValidationError('Please select a reason for rejection.')
      return
    }
    setValidationError(null)
    onConfirmReject(item, selectedReason)
  }

  return (
    <div className="reject-video-screen">
      <div className="reject-video-container">
        {/* Blue Top Header Bar */}
        <header className="reject-video-header">
          <button
            type="button"
            className="reject-video-back-btn"
            onClick={onBack}
            aria-label="Back to Review Video"
          >
            <ChevronLeftIcon className="reject-video-back-icon" />
          </button>
          <h1 className="reject-video-title">Reject Video</h1>
        </header>

        {/* Main Content Body */}
        <main className="reject-video-body">
          {/* Centered Red Warning Badge with X */}
          <div className="reject-video-badge-wrap">
            <div className="reject-video-badge" aria-hidden="true">
              <CloseIcon className="reject-video-badge-icon" />
            </div>
          </div>

          {/* Heading */}
          <h2 className="reject-video-heading">Reject this video?</h2>

          {/* Administrative Notice */}
          <p className="reject-video-notice">
            This is an administrative action. The video will be rejected from the platform and will no longer appear in the moderation queue.
          </p>

          {/* Video / Service Context Box */}
          <div className="reject-video-context-box">
            <span>{item.serviceName} — {item.providerName}</span>
          </div>

          {/* Reason Section Heading */}
          <h3 className="reject-video-section-title">Reason for rejection</h3>

          {/* Reason Options List */}
          <div className="reject-video-reasons-list" role="radiogroup" aria-label="Reason for rejection">
            {REJECTION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason
              return (
                <button
                  key={reason}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`reject-video-reason-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedReason(reason)
                    setValidationError(null)
                  }}
                >
                  <div className={`reject-video-radio-circle ${isSelected ? 'selected' : ''}`} aria-hidden="true">
                    {isSelected && <div className="reject-video-radio-dot" />}
                  </div>
                  <span className="reject-video-reason-text">{reason}</span>
                </button>
              )
            })}
          </div>

          {validationError && (
            <p className="reject-video-error-msg" role="alert">
              {validationError}
            </p>
          )}

          {/* Bottom Actions: Cancel & Reject Video */}
          <div className="reject-video-actions">
            <button
              type="button"
              className="reject-video-cancel-btn"
              onClick={onCancel}
            >
              Cancel
            </button>

            <button
              type="button"
              className="reject-video-confirm-btn"
              onClick={handleRejectClick}
            >
              Reject Video
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
