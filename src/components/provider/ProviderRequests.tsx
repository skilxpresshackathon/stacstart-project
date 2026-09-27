import { useState } from 'react'
import type { BookingRequest, BookingStatus } from '../../types/marketplace'
import {
  ChevronLeftIcon,
  MenuLinesIcon,
  ClockIcon,
  ChatIcon,
  CheckIcon,
  CloseIcon,
  StarIcon,
  TrashIcon,
} from '../common/Icons'

type StatusTab = 'All' | 'Pending' | 'Accepted' | 'In Progress' | 'Declined' | 'Canceled' | 'Completed'

const STATUS_TABS: StatusTab[] = [
  'All',
  'Pending',
  'Accepted',
  'In Progress',
  'Declined',
  'Canceled',
  'Completed',
]

interface ProviderRequestsProps {
  requests: BookingRequest[]
  onBack: () => void
  onMenuClick: () => void
  onOpenDetails: (request: BookingRequest) => void
  onAcceptRequest: (request: BookingRequest) => void
  onDeclineRequest: (request: BookingRequest) => void
  onMarkCompleteRequest: (request: BookingRequest) => void
  onDeleteRequest?: (requestId: string) => void
  onViewRating?: (request: BookingRequest) => void
}

export function ProviderRequests({
  requests,
  onBack,
  onMenuClick,
  onOpenDetails,
  onAcceptRequest,
  onDeclineRequest,
  onMarkCompleteRequest,
  onDeleteRequest,
  onViewRating,
}: ProviderRequestsProps) {
  const [selectedTab, setSelectedTab] = useState<StatusTab>('All')

  // Filter requests according to the selected tab
  const filteredRequests = requests.filter((req) => {
    switch (selectedTab) {
      case 'All':
        return true
      case 'Pending':
        return req.status === 'pending'
      case 'Accepted':
        return req.status === 'accepted'
      case 'In Progress':
        return req.status === 'in_progress'
      case 'Declined':
        return req.status === 'declined'
      case 'Canceled':
        return req.status === 'cancelled'
      case 'Completed':
        return req.status === 'completed'
      default:
        return true
    }
  })

  const renderStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="client-req-badge badge-pending">
            <span className="badge-dot" />
            <span>Pending</span>
          </span>
        )
      case 'accepted':
        return (
          <span className="client-req-badge badge-accepted">
            <CheckIcon className="badge-icon-sm" />
            <span>Accepted</span>
          </span>
        )
      case 'in_progress':
        return (
          <span className="client-req-badge badge-inprogress">
            <ClockIcon className="badge-icon-sm" />
            <span>In Progress</span>
          </span>
        )
      case 'completed':
        return (
          <span className="client-req-badge badge-completed">
            <CheckIcon className="badge-icon-sm" />
            <span>Completed</span>
          </span>
        )
      case 'declined':
        return (
          <span className="client-req-badge badge-declined">
            <CloseIcon className="badge-icon-sm" />
            <span>Declined</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="client-req-badge badge-declined">
            <CloseIcon className="badge-icon-sm" />
            <span>Canceled</span>
          </span>
        )
    }
  }

  return (
    <div className="client-requests-screen">
      <div className="client-requests-container">
        {/* Top Header Bar */}
        <header className="client-requests-header">
          <div className="client-requests-header-left">
            <button
              type="button"
              className="client-requests-back-btn"
              onClick={onBack}
              aria-label="Back to Provider Hub"
            >
              <ChevronLeftIcon />
            </button>
            <h1 className="client-requests-title">Client Requests</h1>
          </div>

          <button
            type="button"
            className="client-requests-menu-btn"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <MenuLinesIcon />
          </button>
        </header>

        {/* Status Filter Tabs */}
        <nav className="client-requests-tabs-nav" aria-label="Request Status Filter">
          <div className="client-requests-tabs-scroll">
            {STATUS_TABS.map((tab) => {
              const isActive = selectedTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  className={`client-requests-tab ${isActive ? 'client-requests-tab-active' : ''}`}
                  onClick={() => setSelectedTab(tab)}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Requests List */}
        <main className="client-requests-content">
          {filteredRequests.length === 0 ? (
            <div className="client-requests-empty">
              <p className="empty-title">No requests found</p>
              <p className="empty-subtitle">
                {selectedTab === 'All'
                  ? 'You do not have any client requests yet.'
                  : `There are currently no requests with "${selectedTab}" status.`}
              </p>
            </div>
          ) : (
            <div className="client-requests-list">
              {filteredRequests.map((req) => (
                <article key={req.id} className="client-request-card">
                  {/* Card Header Row: Service title and status badge */}
                  <div
                    className="client-request-card-top"
                    onClick={() => onOpenDetails(req)}
                    style={{ cursor: 'pointer' }}
                  >
                    <h2 className="client-request-service-title">{req.service.name}</h2>
                    {renderStatusBadge(req.status)}
                  </div>

                  {/* Card Middle Row: Customer name and date/time */}
                  <div
                    className="client-request-card-meta"
                    onClick={() => onOpenDetails(req)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="client-request-customer-name">{req.customerName}</span>
                    <span className="client-request-datetime">
                      <ClockIcon className="meta-clock-icon" />
                      <span>
                        {req.preferredDate || 'Dec 14'}
                        {req.preferredTime ? ` · ${req.preferredTime}` : ''}
                      </span>
                    </span>
                  </div>

                  {/* Card Actions Row based on request status */}
                  <div className="client-request-card-actions">
                    {req.status === 'pending' && (
                      <>
                        <button
                          type="button"
                          className="req-action-btn req-chat-btn"
                          onClick={() => onOpenDetails(req)}
                        >
                          <ChatIcon className="req-btn-icon" />
                          <span>Chat</span>
                        </button>
                        <div className="req-action-btn-group">
                          <button
                            type="button"
                            className="req-icon-btn req-accept-icon-btn"
                            onClick={() => onAcceptRequest(req)}
                            aria-label={`Accept request from ${req.customerName}`}
                            title="Accept Request"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            type="button"
                            className="req-icon-btn req-decline-icon-btn"
                            onClick={() => onDeclineRequest(req)}
                            aria-label={`Decline request from ${req.customerName}`}
                            title="Decline Request"
                          >
                            <CloseIcon />
                          </button>
                        </div>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <>
                        <button
                          type="button"
                          className="req-action-btn req-chat-btn"
                          onClick={() => onOpenDetails(req)}
                        >
                          <ChatIcon className="req-btn-icon" />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          className="req-action-btn req-complete-btn"
                          onClick={() => onMarkCompleteRequest(req)}
                        >
                          <CheckIcon className="req-btn-icon" />
                          <span>Mark Complete</span>
                        </button>
                      </>
                    )}

                    {req.status === 'in_progress' && (
                      <>
                        <button
                          type="button"
                          className="req-action-btn req-chat-btn"
                          onClick={() => onOpenDetails(req)}
                        >
                          <ChatIcon className="req-btn-icon" />
                          <span>Chat</span>
                        </button>
                        <button
                          type="button"
                          className="req-action-btn req-complete-btn"
                          onClick={() => onMarkCompleteRequest(req)}
                        >
                          <CheckIcon className="req-btn-icon" />
                          <span>Mark Complete</span>
                        </button>
                      </>
                    )}

                    {req.status === 'completed' && (
                      <>
                        <button
                          type="button"
                          className="req-action-btn req-rating-btn"
                          onClick={() => onViewRating?.(req)}
                        >
                          <StarIcon className="req-btn-icon star-filled" />
                          <span>View Rating</span>
                        </button>
                        <div className="req-action-btn-group">
                          <button
                            type="button"
                            className="req-icon-btn req-neutral-icon-btn"
                            onClick={() => onOpenDetails(req)}
                            aria-label={`View chat with ${req.customerName}`}
                            title="View Chat"
                          >
                            <ChatIcon />
                          </button>
                          {onDeleteRequest && (
                            <button
                              type="button"
                              className="req-icon-btn req-trash-icon-btn"
                              onClick={() => onDeleteRequest(req.id)}
                              aria-label={`Delete request from ${req.customerName}`}
                              title="Delete Request"
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </>
                    )}

                    {(req.status === 'declined' || req.status === 'cancelled') && (
                      <>
                        <button
                          type="button"
                          className="req-action-btn req-viewchat-btn"
                          onClick={() => onOpenDetails(req)}
                        >
                          <ChatIcon className="req-btn-icon" />
                          <span>View Chat</span>
                        </button>
                        {onDeleteRequest && (
                          <button
                            type="button"
                            className="req-icon-btn req-trash-icon-btn"
                            onClick={() => onDeleteRequest(req.id)}
                            aria-label={`Delete request from ${req.customerName}`}
                            title="Delete Request"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
