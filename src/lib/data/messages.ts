import { supabase } from '../supabase'
import type { ChatMessage } from '../../components/chat/ChatView'

export type { ChatMessage }

export interface SendMessageResult {
  success: boolean
  message?: ChatMessage
  error?: string
}

export interface FetchMessagesResult {
  success: boolean
  messages: ChatMessage[]
  error?: string
}

/**
 * Maps a raw public.messages database row to the UI ChatMessage format.
 */
export function formatMessageRow(
  row: {
    id: string
    booking_id: string
    sender_id: string
    message: string
    created_at: string
  },
  customerId?: string
): ChatMessage {
  const isCustomer = customerId ? row.sender_id === customerId : false
  const d = new Date(row.created_at)

  const timeStr = d
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .replace(' ', '')

  const isToday = d.toDateString() === new Date().toDateString()
  const dateLabel = isToday
    ? 'Today'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return {
    id: row.id,
    sender: isCustomer ? 'customer' : 'provider',
    text: row.message,
    timestamp: timeStr,
    dateLabel,
  }
}

/**
 * Fetches all messages for a specific booking from public.messages.
 * Messages are sorted chronologically (ascending).
 * Secured by database RLS: only booking participants or admins can view messages.
 */
export async function fetchBookingMessages(
  bookingId: string,
  knownCustomerId?: string
): Promise<FetchMessagesResult> {
  try {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()

    if (authErr || !user) {
      return { success: false, messages: [], error: 'You must be signed in to view messages.' }
    }

    if (!bookingId || typeof bookingId !== 'string') {
      return { success: false, messages: [], error: 'Valid booking ID is required.' }
    }

    // Resolve customer_id to accurately distinguish customer vs provider sender bubbles
    let customerId = knownCustomerId
    if (!customerId) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('id', bookingId)
        .maybeSingle()

      if (booking?.customer_id) {
        customerId = booking.customer_id
      }
    }

    const { data: rows, error: mErr } = await supabase
      .from('messages')
      .select('id, booking_id, sender_id, message, created_at')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })

    if (mErr) {
      return { success: false, messages: [], error: mErr.message }
    }

    const messages = (rows || []).map((r) => formatMessageRow(r, customerId))
    return { success: true, messages }
  } catch (err) {
    console.warn('[Data/Messages] Error in fetchBookingMessages:', err)
    return {
      success: false,
      messages: [],
      error: err instanceof Error ? err.message : 'Failed to fetch messages.',
    }
  }
}

/**
 * Inserts a new message into public.messages for the specified booking.
 * Sender identity is always derived from authenticated user (auth.uid()).
 * RLS enforces that only booking participants can insert messages.
 */
export async function sendMessage(
  bookingId: string,
  text: string,
  knownCustomerId?: string
): Promise<SendMessageResult> {
  try {
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()

    if (authErr || !user) {
      return { success: false, error: 'You must be signed in to send a message.' }
    }

    const trimmed = text?.trim()
    if (!trimmed) {
      return { success: false, error: 'Message cannot be empty.' }
    }

    if (!bookingId || typeof bookingId !== 'string') {
      return { success: false, error: 'Valid booking ID is required.' }
    }

    // Verify participation before insert for clean client feedback
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, customer_id, provider_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (bErr || !booking) {
      return { success: false, error: 'Booking not found.' }
    }

    const isCustomer = user.id === booking.customer_id
    if (!isCustomer) {
      // Check if user owns the provider associated with booking.provider_id
      const { data: prov } = await supabase
        .from('providers')
        .select('id')
        .eq('id', booking.provider_id)
        .eq('profile_id', user.id)
        .maybeSingle()

      if (!prov) {
        return { success: false, error: 'You are not an authorized participant in this booking.' }
      }
    }

    // Insert message into public.messages
    const { data: inserted, error: insErr } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id, // always auth.uid()
        message: trimmed,
      })
      .select('id, booking_id, sender_id, message, created_at')
      .single()

    if (insErr || !inserted) {
      return { success: false, error: insErr?.message || 'Failed to send message.' }
    }

    const customerId = knownCustomerId || booking.customer_id
    const chatMsg = formatMessageRow(inserted, customerId)
    return { success: true, message: chatMsg }
  } catch (err) {
    console.warn('[Data/Messages] Error in sendMessage:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error sending message.',
    }
  }
}

/**
 * Safely subscribes to real-time message inserts for a single booking.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeToBookingMessages(
  bookingId: string,
  customerId: string,
  onNewMessage: (msg: ChatMessage) => void
): () => void {
  const channel = supabase
    .channel(`booking-messages-${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      },
      (payload) => {
        if (payload.new) {
          const row = payload.new as {
            id: string
            booking_id: string
            sender_id: string
            message: string
            created_at: string
          }
          const formatted = formatMessageRow(row, customerId)
          onNewMessage(formatted)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
