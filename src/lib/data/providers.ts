import { supabase } from '../supabase'
import type { Provider, Service, VideoItem, Review } from '../../types/marketplace'
import { fetchServicesByProviderId } from './services'

/**
 * Derives a clean two-letter monogram from a business or provider name.
 */
export function getProviderInitials(businessName: string): string {
  if (!businessName) return 'P'
  const words = businessName.trim().split(/\s+/)
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Fetches all marketplace providers from public.providers.
 */
export async function fetchProviders(): Promise<Provider[]> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('id, profile_id, business_name, category, bio, location, profile_image_url, is_verified')
      .order('business_name', { ascending: true })

    if (error) {
      console.warn('[Data/Providers] Error fetching providers:', error.message)
      return []
    }

    if (!data) return []

    return data.map((row) => ({
      id: row.id,
      businessName: row.business_name,
      initials: getProviderInitials(row.business_name),
      category: row.category,
      location: row.location || 'Lagos, Nigeria',
      isVerified: Boolean(row.is_verified),
      avatarUrl: row.profile_image_url || undefined,
      bio: row.bio || undefined,
      reviewCount: 0,
    }))
  } catch (err) {
    console.warn('[Data/Providers] Unexpected error fetching providers:', err)
    return []
  }
}

/**
 * Fetches full provider details including active services, approved videos,
 * and verified reviews.
 */
export async function fetchProviderDetails(providerId: string): Promise<Provider | null> {
  try {
    // 1. Fetch provider core row
    const { data: provRow, error: provErr } = await supabase
      .from('providers')
      .select('id, profile_id, business_name, category, bio, location, profile_image_url, is_verified')
      .eq('id', providerId)
      .maybeSingle()

    if (provErr || !provRow) {
      if (provErr) console.warn('[Data/Providers] Error fetching provider details:', provErr.message)
      return null
    }

    // 2. Fetch active services
    const services: Service[] = await fetchServicesByProviderId(providerId)

    // 3. Fetch approved videos
    const { data: videoRows } = await supabase
      .from('videos')
      .select('id, provider_id, title, duration, video_url, thumbnail_url, storage_path')
      .eq('provider_id', providerId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    const featuredVideos: VideoItem[] = await Promise.all(
      (videoRows || []).map(async (v) => {
        let resolvedVideoUrl = v.video_url || undefined
        if (!resolvedVideoUrl && v.storage_path) {
          try {
            const { data: signed } = await supabase.storage
              .from('provider-videos')
              .createSignedUrl(v.storage_path, 86400)
            if (signed?.signedUrl) {
              resolvedVideoUrl = signed.signedUrl
            }
          } catch {
            // ignore signed URL error
          }
        }
        return {
          id: v.id,
          providerId: v.provider_id,
          duration: v.duration || '0:30',
          videoUrl: resolvedVideoUrl,
          thumbnailUrl: v.thumbnail_url || undefined,
          storagePath: v.storage_path || undefined,
          title: v.title,
        }
      })
    )

    // 4. Fetch real reviews with reviewer display identity (privacy-safe RPC)
    let reviews: Review[] = []
    const { data: rpcRows, error: rpcErr } = await supabase.rpc('get_provider_reviews', {
      p_provider_id: providerId,
    })

    if (!rpcErr && rpcRows && rpcRows.length > 0) {
      reviews = rpcRows.map((r: {
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
      })
    } else {
      // Fallback direct query (respects RLS, sets 'Verified Customer' if reviewer profile is private)
      const { data: reviewRows } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          customer:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false })

      type CustomerProfileRel = { full_name?: string; avatar_url?: string } | null

      reviews = (reviewRows || []).map((r) => {
        const customerRel = r.customer as unknown as CustomerProfileRel
        const authorName = customerRel?.full_name || 'Verified Customer'
        const authorAvatarUrl = customerRel?.avatar_url || undefined
        const dateStr = r.created_at
          ? new Date(r.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recent'

        return {
          id: r.id,
          authorName,
          authorAvatarUrl,
          rating: Number(r.rating) || 5,
          comment: r.comment || '',
          date: dateStr,
        }
      })
    }

    return {
      id: provRow.id,
      businessName: provRow.business_name,
      initials: getProviderInitials(provRow.business_name),
      category: provRow.category,
      location: provRow.location || 'Lagos, Nigeria',
      isVerified: Boolean(provRow.is_verified),
      avatarUrl: provRow.profile_image_url || undefined,
      bio: provRow.bio || undefined,
      reviewCount: reviews.length,
      services,
      featuredVideos,
      reviews,
    }
  } catch (err) {
    console.warn('[Data/Providers] Unexpected error in fetchProviderDetails:', err)
    return null
  }
}
