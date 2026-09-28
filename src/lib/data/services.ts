import { supabase } from '../supabase'
import type { Service, PriceType } from '../../types/marketplace'

/**
 * Format numeric min/max prices into user-facing Nigerian Naira currency strings.
 * Formatting remains purely a presentation concern.
 */
export function formatServicePrice(
  minPrice: number | null | undefined,
  maxPrice: number | null | undefined,
  priceType?: string | null
): string {
  const min = minPrice != null ? Number(minPrice) : 0
  const max = maxPrice != null ? Number(maxPrice) : null

  if (priceType === 'negotiable') {
    return 'Negotiable'
  }

  const formattedMin = `₦${Math.round(min).toLocaleString()}`

  if (max != null && max > min) {
    const formattedMax = `₦${Math.round(max).toLocaleString()}`
    return `${formattedMin} – ${formattedMax}`
  }

  if (priceType === 'starting_from') {
    return `From ${formattedMin}`
  }

  return formattedMin
}

/**
 * Fetches active services for a given provider from public.services.
 */
export async function fetchServicesByProviderId(providerId: string): Promise<Service[]> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id, provider_id, name, description, min_price, max_price, price_type, is_active')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.warn('[Data/Services] Error fetching services for provider:', providerId, error.message)
      return []
    }

    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      providerId: row.provider_id,
      name: row.name,
      description: row.description || undefined,
      priceDisplay: formatServicePrice(row.min_price, row.max_price, row.price_type),
      priceType: (row.price_type as PriceType) || 'fixed',
      minPrice: row.min_price != null ? Number(row.min_price) : 0,
      maxPrice: row.max_price != null ? Number(row.max_price) : undefined,
    }))
  } catch (err) {
    console.warn('[Data/Services] Unexpected error fetching services:', err)
    return []
  }
}
