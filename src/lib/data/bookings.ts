import { supabase } from '../supabase'
import type { BookingRequest, BookingStatus, Provider, Service } from '../../types/marketplace'
import { formatServicePrice } from './services'
import { getProviderInitials } from './providers'

export interface CreateBookingParams {
  providerId: string
  serviceId: string
  videoId?: string | null
  location: string
  customerNotes: string
  requestedDate?: string | null
  requestedTime?: string | null
}

interface RawProviderRel {
  id: string
  business_name: string
  category: string
  location?: string | null
  profile_image_url?: string | null
  is_verified?: boolean | null
}

interface RawServiceRel {
  id: string
  name: string
  category?: string | null
  min_price?: number | null
  max_price?: number | null
  price_type?: string | null
}

interface RawProfileRel {
  full_name?: string | null
}

interface RawBookingRow {
  id: string
  customer_id: string
  provider_id: string
  service_id?: string | null
  video_id?: string | null
  requested_date?: string | null
  requested_time?: string | null
  location: string
  customer_notes: string
  status: string
  rejection_reason?: string | null
  created_at: string
  provider: RawProviderRel | null
  service: RawServiceRel | null
  customer: RawProfileRel | null
}

function mapBookingRow(row: RawBookingRow): BookingRequest {
  const prov = row.provider
  const srv = row.service

  const providerObj: Provider = {
    id: prov?.id || row.provider_id,
    businessName: prov?.business_name || 'Service Provider',
    initials: getProviderInitials(prov?.business_name || 'SP'),
    category: prov?.category || 'Service',
    location: prov?.location || row.location,
    isVerified: Boolean(prov?.is_verified),
    avatarUrl: prov?.profile_image_url || undefined,
  }

  const serviceObj: Service = {
    id: srv?.id || row.service_id || 'srv-unknown',
    providerId: row.provider_id,
    name: srv?.name || 'Requested Service',
    priceDisplay: formatServicePrice(srv?.min_price, srv?.max_price, srv?.price_type),
    priceType: (srv?.price_type as Service['priceType']) || 'fixed',
    minPrice: srv?.min_price != null ? Number(srv.min_price) : 0,
    maxPrice: srv?.max_price != null ? Number(srv.max_price) : undefined,
  }

  let canonicalStatus: BookingStatus = 'pending'
  if (
    row.status === 'accepted' ||
    row.status === 'in_progress' ||
    row.status === 'completed' ||
    row.status === 'declined' ||
    row.status === 'canceled'
  ) {
    canonicalStatus = row.status
  } else if (row.status === 'cancelled') {
    canonicalStatus = 'canceled'
  }

  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer?.full_name || 'Customer',
    provider: providerObj,
    service: serviceObj,
    location: row.location,
    description: row.customer_notes,
    preferredDate: row.requested_date || undefined,
    preferredTime: row.requested_time || undefined,
    status: canonicalStatus,
    createdAt: row.created_at,
    videoId: row.video_id || undefined,
    rejectionReason: row.rejection_reason || undefined,
  }
}

/**
 * Creates a real booking in public.bookings.
 * Validates provider, service active status, and optional video association before persisting.
 */
export async function createBooking(
  params: CreateBookingParams
): Promise<{ data: BookingRequest | null; error: string | null }> {
  try {
    const { data: authData } = await supabase.auth.getUser()
    const user = authData.user
    if (!user) {
      return { data: null, error: 'Please sign in to submit a service request.' }
    }

    if (!params.providerId || !params.serviceId) {
      return { data: null, error: 'Provider and service must be specified.' }
    }

    if (!params.location.trim() || !params.customerNotes.trim()) {
      return { data: null, error: 'Please provide a service location and description.' }
    }

    // 1. Validate provider exists
    const { data: prov, error: provErr } = await supabase
      .from('providers')
      .select('id, business_name, category, location, profile_image_url, is_verified')
      .eq('id', params.providerId)
      .maybeSingle()

    if (provErr || !prov) {
      return { data: null, error: 'The selected service provider could not be found.' }
    }

    // 2. Validate service exists, belongs to provider, and is active
    const { data: srv, error: srvErr } = await supabase
      .from('services')
      .select('id, provider_id, name, category, min_price, max_price, price_type, is_active')
      .eq('id', params.serviceId)
      .maybeSingle()

    if (srvErr || !srv) {
      return { data: null, error: 'The requested service does not exist.' }
    }

    if (srv.provider_id !== params.providerId) {
      return { data: null, error: 'The selected service does not belong to this provider.' }
    }

    if (!srv.is_active) {
      return { data: null, error: 'This service is currently unavailable for booking.' }
    }

    // 3. Optional video validation
    let validVideoId: string | null = null
    if (params.videoId) {
      const { data: vid } = await supabase
        .from('videos')
        .select('id, provider_id')
        .eq('id', params.videoId)
        .maybeSingle()

      if (vid && vid.provider_id === params.providerId) {
        validVideoId = vid.id
      }
    }

    // 4. Insert row into public.bookings (RLS enforces customer_id = auth.uid() and status = 'pending')
    const { data: bookingRow, error: insertErr } = await supabase
      .from('bookings')
      .insert({
        customer_id: user.id,
        provider_id: params.providerId,
        service_id: params.serviceId,
        video_id: validVideoId,
        location: params.location.trim(),
        customer_notes: params.customerNotes.trim(),
        requested_date: params.requestedDate || null,
        requested_time: params.requestedTime || null,
        status: 'pending',
      })
      .select(`
        id,
        customer_id,
        provider_id,
        service_id,
        video_id,
        requested_date,
        requested_time,
        location,
        customer_notes,
        status,
        rejection_reason,
        created_at,
        provider:providers (
          id,
          business_name,
          category,
          location,
          profile_image_url,
          is_verified
        ),
        service:services (
          id,
          name,
          category,
          min_price,
          max_price,
          price_type
        ),
        customer:profiles!bookings_customer_id_fkey (
          full_name
        )
      `)
      .single()

    if (insertErr || !bookingRow) {
      console.warn('[Data/Bookings] Error creating booking:', insertErr?.message)
      return { data: null, error: insertErr?.message || 'Failed to submit service request.' }
    }

    return { data: mapBookingRow(bookingRow as unknown as RawBookingRow), error: null }
  } catch (err) {
    console.warn('[Data/Bookings] Unexpected error in createBooking:', err)
    return { data: null, error: 'An unexpected error occurred while creating your booking.' }
  }
}

/**
 * Fetches bookings for the authenticated customer.
 * RLS automatically restricts to customer_id = auth.uid().
 */
export async function fetchCustomerBookings(): Promise<BookingRequest[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        provider_id,
        service_id,
        video_id,
        requested_date,
        requested_time,
        location,
        customer_notes,
        status,
        rejection_reason,
        created_at,
        provider:providers (
          id,
          business_name,
          category,
          location,
          profile_image_url,
          is_verified
        ),
        service:services (
          id,
          name,
          category,
          min_price,
          max_price,
          price_type
        ),
        customer:profiles!bookings_customer_id_fkey (
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Data/Bookings] Error fetching customer bookings:', error.message)
      return []
    }

    if (!data) return []

    return data.map((row) => mapBookingRow(row as unknown as RawBookingRow))
  } catch (err) {
    console.warn('[Data/Bookings] Unexpected error in fetchCustomerBookings:', err)
    return []
  }
}

/**
 * Fetches incoming service requests for the authenticated provider.
 * RLS automatically restricts to bookings belonging to provider.
 */
export async function fetchProviderBookings(): Promise<BookingRequest[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        provider_id,
        service_id,
        video_id,
        requested_date,
        requested_time,
        location,
        customer_notes,
        status,
        rejection_reason,
        created_at,
        provider:providers (
          id,
          business_name,
          category,
          location,
          profile_image_url,
          is_verified
        ),
        service:services (
          id,
          name,
          category,
          min_price,
          max_price,
          price_type
        ),
        customer:profiles!bookings_customer_id_fkey (
          full_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Data/Bookings] Error fetching provider bookings:', error.message)
      return []
    }

    if (!data) return []

    return data.map((row) => mapBookingRow(row as unknown as RawBookingRow))
  } catch (err) {
    console.warn('[Data/Bookings] Unexpected error in fetchProviderBookings:', err)
    return []
  }
}

/**
 * Fetches a single booking by ID.
 */
export async function fetchBookingById(bookingId: string): Promise<BookingRequest | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        customer_id,
        provider_id,
        service_id,
        video_id,
        requested_date,
        requested_time,
        location,
        customer_notes,
        status,
        rejection_reason,
        created_at,
        provider:providers (
          id,
          business_name,
          category,
          location,
          profile_image_url,
          is_verified
        ),
        service:services (
          id,
          name,
          category,
          min_price,
          max_price,
          price_type
        ),
        customer:profiles!bookings_customer_id_fkey (
          full_name
        )
      `)
      .eq('id', bookingId)
      .maybeSingle()

    if (error || !data) {
      if (error) console.warn('[Data/Bookings] Error fetching booking by id:', error.message)
      return null
    }

    return mapBookingRow(data as unknown as RawBookingRow)
  } catch (err) {
    console.warn('[Data/Bookings] Unexpected error in fetchBookingById:', err)
    return null
  }
}

/**
 * Updates a booking's status.
 * Enforces canonical transitions via database trigger:
 * - Customer: pending -> canceled, accepted -> canceled
 * - Provider: pending -> accepted | declined, accepted -> in_progress, in_progress -> completed
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  rejectionReason?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const canonicalStatus = newStatus === 'cancelled' ? 'canceled' : newStatus

    const updatePayload: Record<string, unknown> = {
      status: canonicalStatus,
      updated_at: new Date().toISOString(),
    }

    if (rejectionReason) {
      updatePayload.rejection_reason = rejectionReason
    }

    const { error } = await supabase
      .from('bookings')
      .update(updatePayload)
      .eq('id', bookingId)

    if (error) {
      console.warn('[Data/Bookings] Error updating booking status:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (err) {
    console.warn('[Data/Bookings] Unexpected error in updateBookingStatus:', err)
    return { success: false, error: 'An unexpected error occurred while updating booking status.' }
  }
}

/**
 * Customer booking cancellation.
 */
export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean; error: string | null }> {
  return updateBookingStatus(bookingId, 'canceled')
}
