import { useState, useRef, useEffect, type FormEvent } from 'react'
import {
  ChevronLeftIcon,
  LocationPinIcon,
  ClockIcon,
  CheckIcon,
  CloseIcon,
  SendIcon,
  LockIcon,
} from '../common/Icons'
import type { BookingRequest, BookingStatus } from '../../types/marketplace'
import type { ChatMessage } from '../chat/ChatView'

interface ProviderRequestDetailsProps {
  request: BookingRequest
  onBack: () => void
  onAccept: (request: BookingRequest) => void
  onDecline: (request: BookingRequest) => void
  onMarkInProgress?: (request: BookingRequest) => void
  onMarkComplete: (request: BookingRequest) => void
  messages?: ChatMessage[]
  onSendMessage?: (text: string) => void
}

function getInitials(name?: string, fallback = 'FO'): string {
  if (!name || !name.trim()) return fallback
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ProviderRequestDetails({
  request,
  onBack,
  onAccept,
  onDecline,
  onMarkInProgress,
  onMarkComplete,
  messages: externalMessages,
  onSendMessage,
}: ProviderRequestDetailsProps) {

  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeMessages = externalMessages !== undefined ? externalMessages : localMessages

  const isReadOnly = request.status === 'declined' || request.status === 'completed' || request.status === 'canceled' || request.status === 'cancelled'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeMessages.length])

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || isReadOnly) return

    const now = new Date()
    const timeStr = now
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(' ', '')

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'provider',
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

  const customerInitials = getInitials(request.customerName)

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
      case 'canceled':
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
    <div className="request-details-screen">
      <div className="request-details-container">
        {/* Top Header Bar */}
        <header className="request-details-header">
          <button
            type="button"
            className="request-details-back-btn"
            onClick={onBack}
            aria-label="Back to Client Requests"
          >
            <ChevronLeftIcon />
          </button>
          <h1 className="request-details-title">Request Details</h1>
        </header>

        {/* Customer Identity Bar */}
        <div className="request-details-customer-bar">
          <div className="customer-bar-left">
            <div className="customer-avatar-circle" aria-label={`Customer ${request.customerName}`}>
              {customerInitials}
            </div>
            <span className="customer-bar-name">{request.customerName}</span>
          </div>
          <div className="customer-bar-right">
            {renderStatusBadge(request.status)}
          </div>
        </div>

        {/* Scrollable Conversation and Summary Area */}
        <div className="request-details-scroll-body">
          {/* Service Request Summary Card */}
          <section className="request-summary-card" aria-label="Service Request Summary">
            <div className="summary-card-header">
              <span className="summary-card-tag">SERVICE REQUEST</span>
            </div>

            <div className="summary-card-row">
              <span className="summary-card-label">Service</span>
              <span className="summary-card-value bold-val">{request.service.name}</span>
            </div>

            <div className="summary-card-row">
              <span className="summary-card-label">
                <LocationPinIcon className="summary-icon" />
                <span>Location</span>
              </span>
              <span className="summary-card-value">{request.location}</span>
            </div>

            <div className="summary-card-row">
              <span className="summary-card-label">
                <ClockIcon className="summary-icon" />
                <span>Date &amp; Time</span>
              </span>
              <span className="summary-card-value">
                {request.preferredDate || 'Dec 14'}
                {request.preferredTime ? ` · ${request.preferredTime}` : ''}
              </span>
            </div>

            {request.description && (
              <p className="summary-card-description">{request.description}</p>
            )}
          </section>

          {/* Action Buttons directly beneath Service Request card */}
          {request.status === 'pending' && (
            <div className="request-details-actions-row">
              <button
                type="button"
                className="details-action-btn details-accept-btn"
                onClick={() => onAccept(request)}
              >
                <CheckIcon className="btn-icon" />
                <span>Accept Request</span>
              </button>
              <button
                type="button"
                className="details-action-btn details-decline-btn"
                onClick={() => onDecline(request)}
              >
                <CloseIcon className="btn-icon" />
                <span>Decline Request</span>
              </button>
            </div>
          )}

          {request.status === 'accepted' && (
            <div className="request-details-actions-full">
              <button
                type="button"
                className="details-action-btn details-complete-btn"
                onClick={() => (onMarkInProgress ? onMarkInProgress(request) : onMarkComplete(request))}
              >
                <ClockIcon className="btn-icon" />
                <span>Mark as In Progress</span>
              </button>
            </div>
          )}

          {request.status === 'in_progress' && (
            <div className="request-details-actions-full">
              <button
                type="button"
                className="details-action-btn details-complete-btn"
                onClick={() => onMarkComplete(request)}
              >
                <CheckIcon className="btn-icon" />
                <span>Mark as Complete</span>
              </button>
            </div>
          )}

          {request.status === 'completed' && (
            <div className="request-details-actions-full">
              <button
                type="button"
                className="details-action-btn details-marked-complete-btn"
                disabled
              >
                <CheckIcon className="btn-icon" />
                <span>Marked as Complete</span>
              </button>
            </div>
          )}

          {/* Messages list */}
          <div className="request-chat-messages">
            {activeMessages.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 16px',
                  color: '#94A3B8',
                  fontSize: '14px',
                }}
              >
                <p>No messages yet. Send a message to start the conversation.</p>
              </div>
            ) : (
              activeMessages.map((msg, index) => {
                const isProvider = msg.sender === 'provider'
                const showDate =
                  index === 0 ||
                  (msg.dateLabel && msg.dateLabel !== activeMessages[index - 1]?.dateLabel)

                return (
                  <div key={msg.id} className="chat-msg-wrapper">
                    {showDate && msg.dateLabel && (
                      <div className="chat-date-separator">
                        <span>{msg.dateLabel}</span>
                      </div>
                    )}
                    <div className={`chat-bubble-row ${isProvider ? 'row-provider' : 'row-customer'}`}>
                      <div className={`chat-bubble ${isProvider ? 'bubble-provider' : 'bubble-customer'}`}>
                        <p className="chat-bubble-text">{msg.text}</p>
                        <span className="chat-bubble-time">{msg.timestamp}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Bar: Composer or Read-Only Banner */}
        <footer className="request-details-footer">
          {isReadOnly ? (
            <div className="request-readonly-banner" role="status">
              <LockIcon className="readonly-lock-icon" />
              <span>
                {request.status === 'completed'
                  ? 'This conversation is read-only because the request was completed.'
                  : 'This conversation is read-only because you declined the request and it is no longer active .'}
              </span>
            </div>
          ) : (
            <form className="request-chat-composer" onSubmit={handleSend}>
              <input
                type="text"
                className="composer-input"
                placeholder="Send a message about this request..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                className="composer-send-btn"
                disabled={!inputText.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </form>
          )}
        </footer>
      </div>
    </div>
  )
}
