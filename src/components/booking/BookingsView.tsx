import { useState } from 'react'
import type { BookingRequest, Provider } from '../../types/marketplace'
import {
  ChevronLeftIcon,
  MenuLinesIcon,
  ClockIcon,
  ChatIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  CalendarIcon,
} from '../common/Icons'

type FilterTab = 'All' | 'Pending' | 'Accepted' | 'In Progress' | 'Declined' | 'Canceled' | 'Completed'

const STATUS_TABS: FilterTab[] = [
  'All',
  'Pending',
  'Accepted',
  'In Progress',
  'Declined',
  'Canceled',
  'Completed',
]

interface BookingsViewProps {
  bookings: BookingRequest[]
  onBackToDiscover: () => void
  onProviderClick?: (provider: Provider) => void
  onMenuClick?: () => void
  onOpenChat?: (booking: BookingRequest) => void
  onReviewBooking?: (booking: BookingRequest) => void
  onDeleteBooking?: (bookingId: string) => void
  onEditBooking?: (booking: BookingRequest) => void
  activeTab?: FilterTab
  onTabChange?: (tab: FilterTab) => void
}

export function BookingsView({
  bookings,
  onBackToDiscover,
  onProviderClick,
  onMenuClick,
  onOpenChat,
  onReviewBooking,
  onDeleteBooking,
  onEditBooking,
  activeTab,
  onTabChange,
}: BookingsViewProps) {
  const [internalTab, setInternalTab] = useState<FilterTab>('All')
  const selectedTab = activeTab !== undefined ? activeTab : internalTab

  const handleTabClick = (tab: FilterTab) => {
    setInternalTab(tab)
    onTabChange?.(tab)
  }

  // Filter bookings according to active tab
  const filteredBookings = bookings.filter((booking) => {
    if (selectedTab === 'All') return true
    if (selectedTab === 'Pending') return booking.status === 'pending'
    if (selectedTab === 'Accepted') return booking.status === 'accepted'
    if (selectedTab === 'In Progress') return booking.status === 'in_progress'
    if (selectedTab === 'Declined') return booking.status === 'declined'
    if (selectedTab === 'Canceled') return booking.status === 'cancelled'
    if (selectedTab === 'Completed') return booking.status === 'completed'
    return true
  })

  return (
    <section className="bookings-view" aria-label="My Bookings">
      {/* Top Header Bar */}
      <header className="bookings-header-bar">
        <div className="bookings-header-left">
          <button
            type="button"
            className="bookings-back-btn"
            onClick={onBackToDiscover}
            aria-label="Back to Discover"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="bookings-title">My Bookings</h1>
        </div>

        <button
          type="button"
          className="bookings-menu-btn"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <MenuLinesIcon />
        </button>
      </header>

      {/* Filter / Status Tabs Bar */}
      <div className="bookings-tabs-bar" role="tablist" aria-label="Booking status filters">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedTab === tab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`booking-tab-pill ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Bookings Content */}
      <div className="bookings-content-area">
        {filteredBookings.length === 0 ? (
          <div className="empty-state bookings-empty">
            <CalendarIcon className="empty-state-icon" />
            <p className="empty-state-title">
              {selectedTab === 'All' ? 'No bookings yet' : `No ${selectedTab.toLowerCase()} bookings`}
            </p>
            <p className="empty-state-subtitle">
              {selectedTab === 'All'
                ? 'Browse service providers on Discover to find and book local services.'
                : `You currently have no bookings marked as ${selectedTab.toLowerCase()}.`}
            </p>
            <button
              type="button"
              className="browse-discover-btn"
              onClick={onBackToDiscover}
            >
              Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="bookings-list" role="feed" aria-label="Bookings list">
            {filteredBookings.map((booking) => (
              <BookingCardItem
                key={booking.id}
                booking={booking}
                onProviderClick={onProviderClick}
                onOpenChat={onOpenChat}
                onReviewBooking={onReviewBooking}
                onDeleteBooking={onDeleteBooking}
                onEditBooking={onEditBooking}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

interface BookingCardItemProps {
  booking: BookingRequest
  onProviderClick?: (provider: Provider) => void
  onOpenChat?: (booking: BookingRequest) => void
  onReviewBooking?: (booking: BookingRequest) => void
  onDeleteBooking?: (bookingId: string) => void
  onEditBooking?: (booking: BookingRequest) => void
}

function BookingCardItem({
  booking,
  onProviderClick,
  onOpenChat,
  onReviewBooking,
  onDeleteBooking,
  onEditBooking,
}: BookingCardItemProps) {
  const { provider, service, status } = booking

  const dateTimeDisplay = formatBookingDateTime(
    booking.preferredDate,
    booking.preferredTime,
    booking.createdAt
  )

  const isCompleted = status === 'completed'
  const isDeclinedOrCancelled = status === 'declined' || status === 'cancelled'
  const isInProgress = status === 'in_progress'

  return (
    <article className="booking-card">
      {/* Top row: Service title on left, Status badge on right */}
      <div className="booking-card-header">
        <h3 className="booking-card-service-title">{service.name}</h3>
        <span className={`booking-status-pill status-${status}`}>
          {renderStatusIndicator(status)}
        </span>
      </div>

      {/* Second row: Provider on left, Date and time on right */}
      <div className="booking-card-meta-row">
        <button
          type="button"
          className="booking-provider-identity-btn"
          onClick={() => onProviderClick?.(provider)}
          aria-label={`View ${provider.businessName} profile`}
        >
          <span className="booking-provider-name">{provider.businessName}</span>
        </button>

        <div className="booking-datetime">
          <ClockIcon className="booking-clock-icon" />
          <span>{dateTimeDisplay}</span>
        </div>
      </div>

      {/* Action Row */}
      <div className="booking-card-actions">
        {isCompleted ? (
          <>
            <button
              type="button"
              className="booking-action-btn-main review-btn"
              onClick={() => onReviewBooking?.(booking)}
            >
              <StarIcon className="booking-review-star-icon" />
              <span>Review</span>
            </button>
            <button
              type="button"
              className="booking-action-icon-btn"
              onClick={() => onOpenChat?.(booking)}
              aria-label="Chat"
            >
              <ChatIcon className="booking-btn-icon" />
            </button>
            <button
              type="button"
              className="booking-action-icon-btn delete-btn"
              onClick={() => onDeleteBooking?.(booking.id)}
              aria-label="Delete booking"
            >
              <TrashIcon />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="booking-action-btn-main"
              onClick={() => onOpenChat?.(booking)}
            >
              <ChatIcon className="booking-btn-icon" />
              <span>{isDeclinedOrCancelled ? 'View Chat' : 'Chat'}</span>
            </button>
            <button
              type="button"
              className={`booking-action-icon-btn ${isDeclinedOrCancelled || isInProgress ? 'muted' : ''}`}
              onClick={() => onEditBooking?.(booking)}
              aria-label="Edit booking"
              disabled={isDeclinedOrCancelled || isInProgress}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              className="booking-action-icon-btn delete-btn"
              onClick={() => onDeleteBooking?.(booking.id)}
              aria-label="Delete booking"
            >
              <TrashIcon />
            </button>
          </>
        )}
      </div>
    </article>
  )
}

function renderStatusIndicator(status: string) {
  switch (status) {
    case 'pending':
      return (
        <>
          <span className="status-dot pending-dot" aria-hidden="true" />
          <span>Pending</span>
        </>
      )
    case 'accepted':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✓</span>
          <span>Accepted</span>
        </>
      )
    case 'in_progress':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">⏱</span>
          <span>In Progress</span>
        </>
      )
    case 'declined':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✕</span>
          <span>Declined</span>
        </>
      )
    case 'cancelled':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✕</span>
          <span>Canceled</span>
        </>
      )
    case 'completed':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✓</span>
          <span>Completed</span>
        </>
      )
    default:
      return <span>{status}</span>
  }
}

function formatBookingDateTime(preferredDate?: string, preferredTime?: string, createdAt?: string): string {
  if (preferredDate && preferredTime) {
    if (preferredDate.includes('-')) {
      const parts = preferredDate.split('-')
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
        const month = d.toLocaleDateString('en-US', { month: 'short' })
        const day = d.getDate()
        return `${month} ${day} · ${formatTime(preferredTime)}`
      }
    }
    return `${preferredDate} · ${formatTime(preferredTime)}`
  }
  if (preferredDate) return preferredDate
  if (createdAt) {
    const d = new Date(createdAt)
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const day = d.getDate()
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    return `${month} ${day} · ${time}`
  }
  return 'Dec 10 · 2:00 PM'
}

function formatTime(timeStr: string): string {
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr
  }
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  if (isNaN(hour)) return timeStr
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m || '00'} ${period}`
}
