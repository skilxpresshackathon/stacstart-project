import { useState } from 'react'

interface VideoPosterThumbnailProps {
  thumbnailUrl?: string | null
  videoUrl?: string | null
  alt?: string
  className?: string
  fallbackText?: string
}

/**
 * Universal video thumbnail / poster component.
 * Renders:
 * 1. Image poster if `thumbnailUrl` is provided and valid.
 * 2. HTML5 `<video preload="metadata">` seeking to #t=0.001 to paint the native first frame if `videoUrl` is provided.
 * 3. Consistent, elegant dark Discover fallback backdrop if neither is available or on media error.
 */
export function VideoPosterThumbnail({
  thumbnailUrl,
  videoUrl,
  alt = '',
  className = '',
  fallbackText,
}: VideoPosterThumbnailProps) {
  const [hasImgError, setHasImgError] = useState(false)
  const [hasVideoError, setHasVideoError] = useState(false)

  if (thumbnailUrl && !hasImgError) {
    return (
      <img
        src={thumbnailUrl}
        alt={alt}
        className={className}
        onError={() => setHasImgError(true)}
        loading="lazy"
      />
    )
  }

  if (videoUrl && !hasVideoError) {
    const videoSrc = videoUrl.includes('#') ? videoUrl : `${videoUrl}#t=0.001`
    return (
      <video
        src={videoSrc}
        preload="metadata"
        playsInline
        muted
        aria-hidden="true"
        tabIndex={-1}
        className={className}
        style={{ pointerEvents: 'none' }}
        onError={() => setHasVideoError(true)}
      />
    )
  }

  return (
    <div className={`${className} video-fallback-poster`} aria-hidden="true">
      {fallbackText ? (
        <span className="video-fallback-text">{fallbackText}</span>
      ) : null}
    </div>
  )
}
