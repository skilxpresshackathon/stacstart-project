import { supabase } from '../supabase'
import type { MarketplaceItem, Provider, Service, VideoItem } from '../../types/marketplace'
import type { ProviderVideoItem, ModerationVideoItem, ProviderVideoStatus, ModerationVideoStatus } from '../mockData'
import { formatServicePrice } from './services'
import { getProviderInitials } from './providers'

interface RawProviderRel {
  id: string
  business_name: string
  category: string
  bio?: string | null
  location?: string | null
  profile_image_url?: string | null
  is_verified?: boolean | null
}

interface RawServiceRel {
  id: string
  name: string
  category?: string | null
  description?: string | null
  min_price?: number | null
  max_price?: number | null
  price_type?: string | null
}

interface RawVideoRow {
  id: string
  provider_id: string
  service_id?: string | null
  title: string
  description?: string | null
  video_url?: string | null
  thumbnail_url?: string | null
  duration?: string | null
  min_price?: number | null
  max_price?: number | null
  views_count?: number | null
  status: string
  created_at: string
  provider: RawProviderRel | null
  service: RawServiceRel | null
}

/**
 * Fetches approved videos for the Discover feed and search experience.
 * Only approved videos are retrieved (enforced by RLS and client filter).
 */
export async function fetchDiscoverMarketplaceItems(): Promise<MarketplaceItem[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        id,
        provider_id,
        service_id,
        title,
        description,
        video_url,
        thumbnail_url,
        duration,
        min_price,
        max_price,
        views_count,
        status,
        created_at,
        provider:providers (
          id,
          business_name,
          category,
          bio,
          location,
          profile_image_url,
          is_verified
        ),
        service:services (
          id,
          name,
          category,
          description,
          min_price,
          max_price,
          price_type
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Data/Videos] Error fetching discover marketplace items:', error.message)
      return []
    }

    if (!data) return []

    // Fetch review ratings map for providers present in the feed
    const providerIds = Array.from(
      new Set(
        data
          .map((row) => (row.provider as unknown as RawProviderRel)?.id)
          .filter((id): id is string => Boolean(id))
      )
    )

    const providerRatingMap: Record<string, { avg: number; count: number }> = {}

    if (providerIds.length > 0) {
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('provider_id, rating')
        .in('provider_id', providerIds)

      if (reviewsData) {
        for (const rev of reviewsData) {
          if (!providerRatingMap[rev.provider_id]) {
            providerRatingMap[rev.provider_id] = { avg: 0, count: 0 }
          }
          const entry = providerRatingMap[rev.provider_id]
          entry.avg = (entry.avg * entry.count + Number(rev.rating)) / (entry.count + 1)
          entry.count++
        }
      }
    }

    const items: MarketplaceItem[] = []

    for (const rawRow of data) {
      const row = rawRow as unknown as RawVideoRow
      const prov = row.provider
      if (!prov) continue

      const srv = row.service
      const ratingData = providerRatingMap[prov.id]
      const rating = ratingData && ratingData.count > 0 ? ratingData.avg : 0

      const providerObj: Provider = {
        id: prov.id,
        businessName: prov.business_name,
        initials: getProviderInitials(prov.business_name),
        category: prov.category,
        location: prov.location || 'Lagos, Nigeria',
        isVerified: Boolean(prov.is_verified),
        avatarUrl: prov.profile_image_url || undefined,
        bio: prov.bio || undefined,
        reviewCount: ratingData ? ratingData.count : 0,
      }

      const serviceObj: Service = {
        id: srv?.id || `srv-${row.id}`,
        providerId: prov.id,
        name: srv?.name || row.title,
        description: srv?.description || row.description || undefined,
        priceDisplay: formatServicePrice(
          srv?.min_price ?? row.min_price,
          srv?.max_price ?? row.max_price,
          srv?.price_type
        ),
        priceType: (srv?.price_type as Service['priceType']) || 'fixed',
        minPrice: srv?.min_price != null ? Number(srv.min_price) : (row.min_price != null ? Number(row.min_price) : 0),
        maxPrice: srv?.max_price != null ? Number(srv.max_price) : (row.max_price != null ? Number(row.max_price) : undefined),
      }

      const videoObj: VideoItem = {
        id: row.id,
        providerId: prov.id,
        duration: row.duration || '0:30',
        videoUrl: row.video_url || undefined,
        thumbnailUrl: row.thumbnail_url || undefined,
        title: row.title,
      }

      items.push({
        id: row.id,
        provider: providerObj,
        service: serviceObj,
        video: videoObj,
        rating,
      })
    }

    return items
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error fetching marketplace items:', err)
    return []
  }
}

/**
 * Fetches all videos for a given provider (for the provider hub manage videos screen).
 * Resolves user profile id to provider id if necessary.
 */
export async function fetchProviderVideos(userOrProviderId: string): Promise<ProviderVideoItem[]> {
  try {
    // Check if the passed ID is a provider.id or profiles.id
    let actualProviderId = userOrProviderId
    const { data: provRow } = await supabase
      .from('providers')
      .select('id')
      .or(`id.eq.${userOrProviderId},profile_id.eq.${userOrProviderId}`)
      .maybeSingle()

    if (provRow?.id) {
      actualProviderId = provRow.id
    }

    const { data, error } = await supabase
      .from('videos')
      .select('id, title, status, thumbnail_url, duration, video_url, created_at')
      .eq('provider_id', actualProviderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Data/Videos] Error fetching provider videos:', error.message)
      return []
    }

    if (!data) return []

    return data.map((v) => ({
      id: v.id,
      title: v.title,
      status: v.status as ProviderVideoStatus,
      thumbnailUrl: v.thumbnail_url || undefined,
    }))
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error in fetchProviderVideos:', err)
    return []
  }
}

/**
 * Fetches all videos for admin moderation (reads pending, approved, and rejected videos).
 */
export async function fetchAdminModerationVideos(): Promise<ModerationVideoItem[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        status,
        video_url,
        thumbnail_url,
        created_at,
        provider:providers (
          business_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Data/Videos] Error fetching admin moderation videos:', error.message)
      return []
    }

    if (!data) return []

    type ProviderNameRel = { business_name?: string } | null

    return data.map((v) => {
      const provRel = v.provider as unknown as ProviderNameRel
      let status: ModerationVideoStatus = 'pending'
      if (v.status === 'approved') status = 'approved'
      else if (v.status === 'rejected') status = 'rejected'

      return {
        id: v.id,
        title: v.title,
        providerName: provRel?.business_name || 'Service Provider',
        status,
        videoUrl: v.video_url || undefined,
        thumbnailUrl: v.thumbnail_url || undefined,
      }
    })
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error in fetchAdminModerationVideos:', err)
    return []
  }
}
