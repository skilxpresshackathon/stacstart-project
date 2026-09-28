import { supabase } from '../supabase'
import type { Review } from '../../types/marketplace'

export interface CreateReviewInput {
  bookingId: string
  providerId: string
  rating: number
  comment?: string
}

export interface CreateReviewResult {
  success: boolean
  review?: Review
  error?: string
}

/**
 * Inserts a customer review into public.reviews.
 * Enforces customer authentication, completed booking check, rating constraints (1-5),
 * and duplicate review prevention.
 */
export async function createReview(input: CreateReviewInput): Promise<CreateReviewResult> {
  try {
    const { bookingId, providerId, rating, comment } = input

    // 1. Authenticate user
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser()

    if (authErr || !user) {
      return { success: false, error: 'You must be signed in to submit a review.' }
    }

    // 2. Validate rating range (1-5)
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5.' }
    }

    // 3. Client-side check on booking ownership and completion status
    const { data: booking, error: bErr } = await supabase
      .from('bookings')
      .select('id, status, customer_id, provider_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (bErr || !booking) {
      return { success: false, error: 'Booking not found.' }
    }

    if (booking.customer_id !== user.id) {
      return { success: false, error: 'You can only review your own bookings.' }
    }

    if (booking.status !== 'completed') {
      return { success: false, error: 'Only completed bookings can be reviewed.' }
    }

    // 4. Insert review into public.reviews
    const { data: inserted, error: insErr } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        customer_id: user.id,
        provider_id: providerId,
        rating: Math.round(rating * 10) / 10,
        comment: comment?.trim() || null,
      })
      .select('id, rating, comment, created_at')
      .single()

    if (insErr) {
      if (insErr.code === '23505' || insErr.message.includes('unique')) {
        return {
          success: false,
          error: 'You have already submitted a review for this booking.',
        }
      }
      return { success: false, error: insErr.message }
    }

    const dateStr = inserted.created_at
      ? new Date(inserted.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Just now'

    const reviewObj: Review = {
      id: inserted.id,
      authorName: user.user_metadata?.full_name || 'You',
      rating: Number(inserted.rating),
      comment: inserted.comment || '',
      date: dateStr,
    }

    return {
      success: true,
      review: reviewObj,
    }
  } catch (err) {
    console.warn('[Data/Reviews] Unexpected error in createReview:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error submitting review.',
    }
  }
}

/**
 * Fetches reviews for a given provider via the secure get_provider_reviews RPC.
 * Does not expose reviewer email, phone, or private profile fields.
 */
export async function fetchProviderReviews(providerId: string): Promise<Review[]> {
  try {
    const { data: rpcRows, error: rpcErr } = await supabase.rpc('get_provider_reviews', {
      p_provider_id: providerId,
    })

    if (!rpcErr && rpcRows && rpcRows.length > 0) {
      return rpcRows.map(
        (r: {
          id: string
          rating: number
          comment?: string | null
          created_at?: string | null
          reviewer_name?: string | null
          reviewer_avatar_url?: string | null
        }) => {
          const dateStr = r.created_at
            ? new Date(r.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recent'

          return {
            id: r.id,
            authorName: r.reviewer_name || 'Verified Customer',
            authorAvatarUrl: r.reviewer_avatar_url || undefined,
            rating: Number(r.rating) || 5,
            comment: r.comment || '',
            date: dateStr,
          }
        }
      )
    }

    return []
  } catch (err) {
    console.warn('[Data/Reviews] Error in fetchProviderReviews:', err)
    return []
  }
}

/**
 * Fetches the review submitted for a specific booking (if any).
 */
export async function fetchReviewForBooking(bookingId: string): Promise<Review | null> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at')
      .eq('booking_id', bookingId)
      .maybeSingle()

    if (error || !data) return null

    const dateStr = data.created_at
      ? new Date(data.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Recent'

    return {
      id: data.id,
      authorName: 'You',
      rating: Number(data.rating),
      comment: data.comment || '',
      date: dateStr,
    }
  } catch (err) {
    console.warn('[Data/Reviews] Error in fetchReviewForBooking:', err)
    return null
  }
}

/**
 * Fetches the set of booking IDs already reviewed by the given customer.
 */
export async function fetchCustomerReviewedBookingIds(customerId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('booking_id')
      .eq('customer_id', customerId)

    if (error || !data) return new Set()
    return new Set(data.map((r) => r.booking_id))
  } catch (err) {
    console.warn('[Data/Reviews] Error in fetchCustomerReviewedBookingIds:', err)
    return new Set()
  }
}
