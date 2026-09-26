import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react'
import {
  ChevronLeftIcon,
  LocationPinIcon,
  ClockIcon,
  SendIcon,
  LockIcon,
} from '../common/Icons'
import type { BookingRequest, Provider } from '../../types/marketplace'

export interface ChatMessage {
  id: string
  sender: 'customer' | 'provider'
  text: string
  timestamp: string
  dateLabel?: string
}

interface ChatViewProps {
  booking: BookingRequest
  onBack: () => void
  onProviderClick: (provider: Provider) => void
  messages?: ChatMessage[]
  onSendMessage?: (text: string) => void
}

export function ChatView({
  booking,
  onBack,
  onProviderClick,
  messages: externalMessages,
  onSendMessage,
}: ChatViewProps) {
  // Derive default initial conversation matching the approved PDFs if no external messages exist
  const defaultInitialMessages = useMemo<ChatMessage[]>(() => {
    const status = booking.status
    if (status === 'completed') {
      return [
        {
          id: 'm1',
          sender: 'customer',
          text: "Hi! I'd like to follow up on my request",
          timestamp: '9:00AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm2',
          sender: 'provider',
          text: 'Hi! Let me check my schedule and get back to you shortly.',
          timestamp: '9:10AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm3',
          sender: 'provider',
          text: "Dec 14 works for me. I've accepted your request.",
          timestamp: '9:15AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm4',
          sender: 'customer',
          text: 'Perfect, thank you!',
          timestamp: '9:30AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm5',
          sender: 'provider',
          text: "I'm on my way to the venue now.",
          timestamp: '11:00AM',
          dateLabel: 'Today',
        },
        {
          id: 'm6',
          sender: 'customer',
          text: 'Great, see you soon!',
          timestamp: '11:10AM',
          dateLabel: 'Today',
        },
        {
          id: 'm7',
          sender: 'provider',
          text: 'All done! It was a pleasure working with you today.',
          timestamp: '4:02PM',
          dateLabel: 'Today',
        },
      ]
    }

    if (status === 'in_progress') {
      return [
        {
          id: 'm1',
          sender: 'customer',
          text: "Hi! I'd like to follow up on my request",
          timestamp: '9:00AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm2',
          sender: 'provider',
          text: 'Hi! Let me check my schedule and get back to you shortly.',
          timestamp: '9:10AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm3',
          sender: 'provider',
          text: "Dec 14 works for me. I've accepted your request.",
          timestamp: '9:15AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm4',
          sender: 'customer',
          text: 'Perfect, thank you!',
          timestamp: '9:30AM',
          dateLabel: 'Dec 12',
        },
        {
          id: 'm5',
          sender: 'provider',
          text: "I'm on my way to the venue now.",
          timestamp: '11:00AM',
          dateLabel: 'Today',
        },
        {
          id: 'm6',
          sender: 'customer',
          text: 'Great, see you soon!',
          timestamp: '11:10AM',
          dateLabel: 'Today',
        },
      ]
    }

    if (status === 'declined') {
      return [
        {
          id: 'm1',
          sender: 'customer',
          text: "Hi! I'd like to follow up on my request",
          timestamp: '10:00AM',
          dateLabel: 'Today',
        },
        {
          id: 'm2',
          sender: 'provider',
          text: 'Hi! Let me check my schedule and get back to you shortly.',
          timestamp: '10:10AM',
          dateLabel: 'Today',
        },
        {
          id: 'm3',
          sender: 'provider',
          text: "I'm so sorry, I'm not available on Dec 14. I'll have to decline this request.",
          timestamp: '10:10AM',
          dateLabel: 'Today',
        },
      ]
    }

    // Default / Pending / Accepted
    return [
      {
        id: 'm1',
        sender: 'customer',
        text: "Hi! I'd like to follow up on my request",
        timestamp: '10:00AM',
        dateLabel: 'Today',
      },
      {
        id: 'm2',
        sender: 'provider',
        text: 'Hi! Let me check my schedule and get back to you shortly.',
        timestamp: '10:10AM',
        dateLabel: 'Today',
      },
    ]
  }, [booking.status])

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(defaultInitialMessages)
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use external messages if provided, otherwise local state
  const activeMessages = externalMessages || localMessages

  const isReadOnly = booking.status === 'declined' || booking.status === 'completed' || booking.status === 'cancelled'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeMessages.length])

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isReadOnly) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).replace(' ', '')

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: trimmed,
      timestamp: timeStr,
      dateLabel: 'Today',
    }

    if (onSendMessage) {
      onSendMessage(trimmed)
    } else {
      setLocalMessages((prev) => [...prev, newMsg])
    }

    setInputText('')
  }

  // Format date and time for service request card
  const formattedDateTime = formatCardDateTime(
    booking.preferredDate,
    booking.preferredTime,
    booking.createdAt
  )

  const providerInitials =
    booking.provider.initials ||
    booking.provider.businessName
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()

  return (
    <div className="chat-view">
      {/* Top Header Bar */}
      <header className="chat-header-bar">
        <button
          type="button"
          className="chat-back-btn"
          onClick={onBack}
          aria-label="Back to bookings"
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          className="chat-provider-identity-btn"
          onClick={() => onProviderClick(booking.provider)}
          aria-label={`View ${booking.provider.businessName} profile`}
        >
          <div className="chat-avatar-circle" aria-hidden="true">
            {providerInitials}
          </div>
          <span className="chat-provider-name">{booking.provider.businessName}</span>
        </button>
      </header>

      {/* Sub-header Bar (Re: Service & Status) */}
      <div className="chat-subheader-bar">
        <span className="chat-service-ref">Re: {booking.service.name}</span>
        <div className={`booking-status-pill status-${booking.status}`}>
          {renderStatusPillContent(booking.status)}
        </div>
      </div>

      {/* Main Conversation & Summary Area */}
      <main className="chat-scroll-area">
        {/* Service Request Summary Card */}
        <section className="chat-service-summary-card" aria-label="Service Request Summary">
          <div className="chat-card-top-label">SERVICE REQUEST</div>

          <div className="chat-card-row">
            <span className="chat-card-field-name">Service</span>
            <span className="chat-card-field-value bold">{booking.service.name}</span>
          </div>

          <div className="chat-card-row">
            <span className="chat-card-field-name">
              <LocationPinIcon className="chat-field-icon" />
              Location
            </span>
            <span className="chat-card-field-value">{booking.location || booking.provider.location}</span>
          </div>

          <div className="chat-card-row">
            <span className="chat-card-field-name">
              <ClockIcon className="chat-field-icon" />
              Date &amp; Time
            </span>
            <span className="chat-card-field-value">{formattedDateTime}</span>
          </div>

          {booking.description && (
            <div className="chat-card-description">
              {booking.description}
            </div>
          )}
        </section>

        {/* Message Stream */}
        <div className="chat-messages-stream" role="log" aria-label="Conversation messages">
          {activeMessages.map((msg, index) => {
            const showDate =
              msg.dateLabel &&
              (index === 0 || activeMessages[index - 1]?.dateLabel !== msg.dateLabel)

            const isCustomer = msg.sender === 'customer'

            return (
              <div key={msg.id} className="chat-message-group">
                {showDate && (
                  <div className="chat-date-separator">
                    <span>{msg.dateLabel}</span>
                  </div>
                )}

                <div className={`chat-message-row ${isCustomer ? 'row-customer' : 'row-provider'}`}>
                  {!isCustomer && (
                    <div className="chat-message-avatar" aria-hidden="true">
                      {providerInitials}
                    </div>
                  )}

                  <div className={`chat-bubble ${isCustomer ? 'bubble-customer' : 'bubble-provider'}`}>
                    <p className="chat-bubble-text">{msg.text}</p>
                    <span className="chat-bubble-timestamp">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Composer or Read-Only Banner */}
      <footer className="chat-footer-bar">
        {isReadOnly ? (
          <div className="chat-readonly-banner" role="status">
            <LockIcon className="chat-readonly-icon" />
            <span className="chat-readonly-text">
              {booking.status === 'declined'
                ? 'This conversation is read-only because the provider declined this request.'
                : booking.status === 'completed'
                ? 'This conversation is read-only because the service request has been completed.'
                : 'This conversation is read-only because the request was canceled.'}
            </span>
          </div>
        ) : (
          <form className="chat-composer-form" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-composer-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Send a message about this request..."
              aria-label="Send a message about this request"
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputText.trim()}
              aria-label="Send message"
            >
              <SendIcon className="chat-send-icon" />
            </button>
          </form>
        )}
      </footer>
    </div>
  )
}

function renderStatusPillContent(status: string) {
  switch (status) {
    case 'pending':
      return (
        <>
          <span className="status-dot pending-dot" aria-hidden="true" />
          <span>Pending</span>
        </>
      )
    case 'in_progress':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">⏱</span>
          <span>In Progress</span>
        </>
      )
    case 'accepted':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✓</span>
          <span>Accepted</span>
        </>
      )
    case 'declined':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✕</span>
          <span>Declined</span>
        </>
      )
    case 'completed':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✓</span>
          <span>Completed</span>
        </>
      )
    case 'cancelled':
      return (
        <>
          <span className="status-symbol" aria-hidden="true">✕</span>
          <span>Canceled</span>
        </>
      )
    default:
      return <span>{status}</span>
  }
}

function formatCardDateTime(preferredDate?: string, preferredTime?: string, createdAt?: string): string {
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
  return 'Dec 14 · 12:00 PM'
}

function formatTime(timeStr: string): string {
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr
  }
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    let hour = parseInt(parts[0], 10)
    const minute = parts[1]
    const ampm = hour >= 12 ? 'PM' : 'AM'
    hour = hour % 12 || 12
    return `${hour}:${minute} ${ampm}`
  }
  return timeStr
}
