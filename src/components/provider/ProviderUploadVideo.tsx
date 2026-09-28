import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from 'react'
import {
  ChevronLeftIcon,
  MenuLinesIcon,
  VideoCameraIcon,
  UploadTrayIcon,
} from '../common/Icons'
import { uploadProviderVideo } from '../../lib/data/videos'

interface ProviderUploadVideoProps {
  onBack: () => void
  onMenuClick: () => void
  onSubmitSuccess: () => void
}

export function ProviderUploadVideo({
  onBack,
  onMenuClick,
  onSubmitSuccess,
}: ProviderUploadVideoProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [description, setDescription] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Revoke object URL on unmount or file change
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }
    }
  }, [videoPreviewUrl])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl)
      }

      const isVideoMime = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|ogg)$/i.test(file.name)
      if (!isVideoMime) {
        setErrorMessage('Please select a valid video file (MP4, WebM, MOV).')
        return
      }

      if (file.size > 50 * 1024 * 1024) {
        setErrorMessage('Video size exceeds the 50MB limit.')
        return
      }

      setVideoFile(file)
      setVideoPreviewUrl(URL.createObjectURL(file))
      setErrorMessage(null)
    }
  }

  const handleContainerClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!videoFile) {
      setErrorMessage('Please select a video to upload.')
      return
    }

    const isVideoMime = videoFile.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv|ogg)$/i.test(videoFile.name)
    if (!isVideoMime) {
      setErrorMessage('Please select a valid video file (MP4, WebM, MOV).')
      return
    }

    if (videoFile.size > 50 * 1024 * 1024) {
      setErrorMessage('Video size exceeds the 50MB limit.')
      return
    }

    if (!title.trim()) {
      setErrorMessage('Please enter a title for this service.')
      return
    }

    if (!priceRange.trim()) {
      setErrorMessage('Please enter a price range.')
      return
    }

    if (!description.trim()) {
      setErrorMessage('Please enter a short description for this service.')
      return
    }

    setErrorMessage(null)
    setIsUploading(true)

    const res = await uploadProviderVideo({
      file: videoFile,
      title: title.trim(),
      priceRange: priceRange.trim(),
      description: description.trim(),
    })

    setIsUploading(false)

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to upload video. Please try again.')
      return
    }

    // Clean up temporary preview URL
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl)
      setVideoPreviewUrl(null)
    }
    setVideoFile(null)
    setTitle('')
    setPriceRange('')
    setDescription('')

    onSubmitSuccess()
  }

  return (
    <div className="provider-upload-screen">
      <div className="provider-upload-container">
        {/* Top Header Bar */}
        <header className="provider-upload-header">
          <div className="provider-upload-header-left">
            <button
              type="button"
              className="provider-upload-back-btn"
              onClick={onBack}
              aria-label="Back to Provider Hub"
            >
              <ChevronLeftIcon />
            </button>
            <h1 className="provider-upload-title">Upload Video</h1>
          </div>

          <button
            type="button"
            className="provider-upload-menu-btn"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <MenuLinesIcon />
          </button>
        </header>

        {/* Upload Form Content */}
        <main className="provider-upload-content">
          <form className="provider-upload-form" onSubmit={handleSubmit}>
            {/* Hidden Video File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="provider-upload-file-input"
              onChange={handleFileChange}
              tabIndex={-1}
              aria-label="Select video file"
            />

            {/* Video Selection Dropzone / Preview Area */}
            <div
              className={`provider-upload-dropzone ${videoPreviewUrl ? 'has-preview' : ''}`}
              onClick={handleContainerClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleContainerClick()
                }
              }}
              aria-label="Tap to select a video file"
            >
              {videoPreviewUrl ? (
                <div
                  className="provider-upload-preview-wrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <video
                    src={videoPreviewUrl}
                    controls
                    className="provider-upload-video-preview"
                    playsInline
                  />
                  <button
                    type="button"
                    className="provider-upload-change-btn"
                    onClick={handleContainerClick}
                  >
                    Change Video
                  </button>
                </div>
              ) : (
                <div className="provider-upload-empty-placeholder">
                  <div className="provider-upload-camera-wrap" aria-hidden="true">
                    <VideoCameraIcon className="provider-upload-camera-icon" />
                  </div>
                  <span className="provider-upload-prompt-title">Tap to select a video</span>
                  <span className="provider-upload-prompt-subtext">
                    Choose a video that shows your work.
                  </span>
                </div>
              )}
            </div>

            {/* Form Field: Title */}
            <div className="provider-upload-field">
              <label htmlFor="upload-title" className="provider-upload-label">
                Title
              </label>
              <input
                id="upload-title"
                type="text"
                className="provider-upload-input"
                placeholder="What is the service name..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
              />
            </div>

            {/* Form Field: Price Range */}
            <div className="provider-upload-field">
              <label htmlFor="upload-price" className="provider-upload-label">
                Price Range
              </label>
              <input
                id="upload-price"
                type="text"
                className="provider-upload-input"
                placeholder="₦10,000..."
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
              />
            </div>

            {/* Form Field: Description */}
            <div className="provider-upload-field">
              <label htmlFor="upload-desc" className="provider-upload-label">
                Description
              </label>
              <textarea
                id="upload-desc"
                className="provider-upload-textarea"
                placeholder="Write a short description for this service..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                rows={4}
              />
            </div>

            {/* Error Message Feedback */}
            {errorMessage && (
              <div className="provider-upload-error-banner" role="alert">
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Upload Video Submit Action */}
            <button
              type="submit"
              className="provider-upload-submit-btn"
              disabled={isUploading}
            >
              <UploadTrayIcon className="provider-upload-submit-icon" />
              <span>{isUploading ? 'Uploading...' : 'Upload Video'}</span>
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}
