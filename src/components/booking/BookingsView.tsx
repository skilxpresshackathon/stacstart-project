import type { BookingRequest } from '../../types/marketplace'
import { BackArrowIcon, CalendarIcon, LocationPinIcon } from '../common/Icons'

interface BookingsViewProps {
  bookings: BookingRequest[]
  onBackToDiscover: () => void
}

export function BookingsView({ bookings, onBackToDiscover }: BookingsViewProps) {
  return (
    <section className="bookings-view" aria-label="Customer Bookings">
      <div className="bookings-header">
        <button
          type="button"
          className="bookings-back-btn"
          onClick={onBackToDiscover}
          aria-label="Back to Discover"
        >
          <BackArrowIcon />
          <span>Back to Discover</span>
        </button>
        <h1 className="bookings-title">My Bookings</h1>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state bookings-empty">
          <CalendarIcon className="empty-state-icon" />
          <p className="empty-state-title">No bookings yet</p>
          <p className="empty-state-subtitle">
            Browse service providers on Discover to find and book local services.
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
        <div className="bookings-list">
          {bookings.map((booking) => (
            <article key={booking.id} className="booking-card">
              <div className="booking-card-top">
                <div className="booking-provider-info">
                  <div className="provider-avatar" aria-hidden="true">
                    {booking.provider.initials}
                  </div>
                  <div>
                    <h3 className="booking-provider-name">{booking.provider.businessName}</h3>
                    <span className="booking-category">{booking.provider.category}</span>
                  </div>
                </div>

                <span className={`booking-status-badge status-${booking.status}`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>

              <div className="booking-card-details">
                <h4 className="booking-service-title">{booking.service.name}</h4>
                <div className="booking-meta-line">
                  <span className="booking-price">{booking.service.priceDisplay}</span>
                  <div className="booking-location">
                    <LocationPinIcon />
                    <span>{booking.location}</span>
                  </div>
                </div>

                {booking.description && (
                  <p className="booking-desc-text">
                    <strong>Request:</strong> {booking.description}
                  </p>
                )}

                {(booking.preferredDate || booking.preferredTime) && (
                  <div className="booking-schedule-tag">
                    <CalendarIcon />
                    <span>
                      {booking.preferredDate} {booking.preferredTime ? `at ${booking.preferredTime}` : ''}
                    </span>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
