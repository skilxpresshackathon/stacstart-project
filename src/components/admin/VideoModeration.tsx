import { useState } from 'react'
import { ChevronLeftIcon, MenuLinesIcon, PlayIcon } from '../common/Icons'
import {
  type ModerationVideoItem,
  INITIAL_MODERATION_VIDEOS,
} from '../../lib/mockData'

export type ModerationTab = 'Approved' | 'Pending' | 'Rejected'

interface VideoModerationProps {
  videos?: ModerationVideoItem[]
  onBack: () => void
  onMenuClick: () => void
  onReviewVideo: (video: ModerationVideoItem) => void
}

export function VideoModeration({
  videos = INITIAL_MODERATION_VIDEOS,
  onBack,
  onMenuClick,
  onReviewVideo,
}: VideoModerationProps) {
  const [selectedTab, setSelectedTab] = useState<ModerationTab | 'All'>('All')

  const filteredVideos = videos.filter((v) => {
    if (selectedTab === 'All') return true
    if (selectedTab === 'Approved') return v.status === 'approved'
    if (selectedTab === 'Pending') return v.status === 'pending'
    if (selectedTab === 'Rejected') return v.status === 'rejected'
    return true
  })

  const handleTabClick = (tab: ModerationTab) => {
    setSelectedTab((curr) => (curr === tab ? 'All' : tab))
  }

  return (
    <div className="video-moderation-screen">
      <div className="video-moderation-container">
        {/* Blue Header Bar */}
        <header className="video-moderation-header">
          <div className="video-moderation-header-left">
            <button
              type="button"
              className="video-moderation-back-btn"
              onClick={onBack}
              aria-label="Back"
            >
              <ChevronLeftIcon className="video-moderation-back-icon" />
            </button>
            <h1 className="video-moderation-title">Video Moderation</h1>
          </div>
          <button
            type="button"
            className="video-moderation-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <MenuLinesIcon className="video-moderation-menu-icon" />
          </button>
        </header>

        {/* Status Filter Tabs */}
        <nav className="video-moderation-tabs-nav" aria-label="Filter videos by status">
          {(['Approved', 'Pending', 'Rejected'] as ModerationTab[]).map((tab) => {
            const isActive = selectedTab === tab
            return (
              <button
                key={tab}
                type="button"
                className={`video-moderation-tab ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            )
          })}
        </nav>

        {/* Video Moderation List */}
        <main className="video-moderation-content">
          {filteredVideos.length === 0 ? (
            <div className="video-moderation-empty">
              <p>No videos found with status &quot;{selectedTab}&quot;.</p>
            </div>
          ) : (
            <div className="video-moderation-list" role="list">
              {filteredVideos.map((item) => (
                <div key={item.id} className="video-moderation-card" role="listitem">
                  {/* Left thumbnail placeholder */}
                  <div className="video-moderation-thumb" aria-hidden="true">
                    <div className="video-moderation-play-circle">
                      <PlayIcon className="video-moderation-play-icon" />
                    </div>
                  </div>

                  {/* Right information block */}
                  <div className="video-moderation-card-info">
                    <h2 className="video-moderation-card-title">{item.title}</h2>
                    <p className="video-moderation-card-provider">{item.providerName}</p>

                    {/* Status badge or Review action */}
                    {item.status === 'pending' ? (
                      <button
                        type="button"
                        className="video-moderation-review-btn"
                        onClick={() => onReviewVideo(item)}
                      >
                        Review
                      </button>
                    ) : item.status === 'approved' ? (
                      <span className="video-moderation-status-badge status-approved">
                        Approved
                      </span>
                    ) : (
                      <span className="video-moderation-status-badge status-rejected">
                        Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
