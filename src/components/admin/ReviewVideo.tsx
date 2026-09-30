import { useState, useEffect, useRef } from 'react'
import { ChevronLeftIcon, PlayIcon, CheckIcon, CloseIcon } from '../common/Icons'
import { type ReviewVideoItem, DEFAULT_REVIEW_VIDEO_ITEM } from '../../lib/mockData'
import { getVideoPlaybackUrl } from '../../lib/data/videos'

interface ReviewVideoProps {
  item?: ReviewVideoItem
  onBack: () => void
  onApprove: (item: ReviewVideoItem) => void
  onReject: (item: ReviewVideoItem) => void
  isProcessing?: boolean
}

export function ReviewVideo({
  item = DEFAULT_REVIEW_VIDEO_ITEM,
  onBack,
  onApprove,
  onReject,
  isProcessing = false,
}: ReviewVideoProps) {
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(item.videoUrl || null)
  const [isLoading, setIsLoading] = useState(!item.videoUrl && Boolean(item.storagePath))
  const [hasError, setHasError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    let isMounted = true

    if (!item.videoUrl && item.storagePath) {
      getVideoPlaybackUrl(item.storagePath).then((url) => {
        if (!isMounted) return
        if (url) {
          setResolvedUrl(url)
          setHasError(false)
        } else {
          setHasError(true)
        }
        setIsLoading(false)
      }).catch(() => {
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      })
    }

    return () => {
      isMounted = false
    }
  }, [item.videoUrl, item.storagePath])

  const handlePlayToggle = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleRetry = () => {
    if (item.storagePath) {
      setIsLoading(true)
      setHasError(false)
      getVideoPlaybackUrl(item.storagePath).then((url) => {
        if (url) {
          setResolvedUrl(url)
          setHasError(false)
        } else {
          setHasError(true)
        }
        setIsLoading(false)
      })
    }
  }

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
          {isLoading ? (
            <div className="review-video-status-msg">
              <p>Loading video preview...</p>
            </div>
          ) : hasError ? (
            <div className="review-video-status-msg">
              <p>Unable to load video preview.</p>
              <button
                type="button"
                className="review-video-retry-btn"
                onClick={handleRetry}
              >
                Retry
              </button>
            </div>
          ) : resolvedUrl ? (
            <div className="review-video-player-wrap">
              <video
                ref={videoRef}
                src={resolvedUrl.includes('#') ? resolvedUrl : `${resolvedUrl}#t=0.001`}
                className="review-video-player"
                controls
                playsInline
                preload="metadata"
                poster={item.thumbnailUrl}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setHasError(true)}
              />
              {!isPlaying && (
                <div className="review-video-play-overlay">
                  <button
                    type="button"
                    className="review-video-play-btn"
                    aria-label="Play preview video"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayToggle()
                    }}
                  >
                    <PlayIcon className="review-video-play-icon" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="review-video-status-msg">
              <p>No video source attached.</p>
            </div>
          )}
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
              disabled={isProcessing}
            >
              <CheckIcon className="review-video-btn-icon" />
              <span>{isProcessing ? 'Processing...' : 'Approve Video'}</span>
            </button>

            <button
              type="button"
              className="review-video-action-btn review-video-reject-btn"
              onClick={() => onReject(item)}
              disabled={isProcessing}
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
