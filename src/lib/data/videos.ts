import { supabase } from '../supabase'
import type { MarketplaceItem, Provider, Service, VideoItem } from '../../types/marketplace'
import {
  type ProviderVideoItem,
  type ModerationVideoItem,
  type ProviderVideoStatus,
  type ModerationVideoStatus,
  parsePriceRange,
} from '../mockData'
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
  storage_path?: string | null
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
        storage_path,
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

      let resolvedVideoUrl = row.video_url || undefined
      if (!resolvedVideoUrl && row.storage_path) {
        try {
          const { data: signed } = await supabase.storage
            .from('provider-videos')
            .createSignedUrl(row.storage_path, 86400)
          if (signed?.signedUrl) {
            resolvedVideoUrl = signed.signedUrl
          }
        } catch {
          // ignore signed URL failure
        }
      }

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
        videoUrl: resolvedVideoUrl,
        storagePath: row.storage_path || undefined,
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
 * Generates signed URLs for private storage playback.
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
      .select('id, title, status, thumbnail_url, duration, video_url, storage_path, created_at')
      .eq('provider_id', actualProviderId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[Data/Videos] Error fetching provider videos:', error.message)
      return []
    }

    if (!data) return []

    const items: ProviderVideoItem[] = await Promise.all(
      data.map(async (v) => {
        let resolvedVideoUrl = v.video_url || undefined
        if (!resolvedVideoUrl && v.storage_path) {
          try {
            const { data: signed } = await supabase.storage
              .from('provider-videos')
              .createSignedUrl(v.storage_path, 3600)
            if (signed?.signedUrl) {
              resolvedVideoUrl = signed.signedUrl
            }
          } catch {
            // ignore signed URL errors
          }
        }

        return {
          id: v.id,
          title: v.title,
          status: v.status as ProviderVideoStatus,
          thumbnailUrl: v.thumbnail_url || undefined,
          videoUrl: resolvedVideoUrl,
          storagePath: v.storage_path || undefined,
        }
      })
    )

    return items
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error in fetchProviderVideos:', err)
    return []
  }
}

/**
 * Fetches all videos for admin moderation (reads pending, approved, and rejected videos).
 * Generates signed URLs for moderation preview.
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
        storage_path,
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

    const items: ModerationVideoItem[] = await Promise.all(
      data.map(async (v) => {
        const provRel = v.provider as unknown as ProviderNameRel
        let status: ModerationVideoStatus = 'pending'
        if (v.status === 'approved') status = 'approved'
        else if (v.status === 'rejected') status = 'rejected'

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
            // ignore signed URL errors
          }
        }

        return {
          id: v.id,
          title: v.title,
          providerName: provRel?.business_name || 'Service Provider',
          status,
          videoUrl: resolvedVideoUrl,
          storagePath: v.storage_path || undefined,
          thumbnailUrl: v.thumbnail_url || undefined,
        }
      })
    )

    return items
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error in fetchAdminModerationVideos:', err)
    return []
  }
}

/**
 * Resolves a fresh signed URL for video streaming / HTML5 playback.
 * Valid for 24 hours (86,400s) to prevent playback interruption.
 */
export async function getVideoPlaybackUrl(storagePath?: string | null): Promise<string | null> {
  if (!storagePath) return null
  try {
    const { data, error } = await supabase.storage
      .from('provider-videos')
      .createSignedUrl(storagePath, 86400)

    if (error || !data?.signedUrl) {
      console.warn('[Data/Videos] createSignedUrl error:', error?.message)
      return null
    }
    return data.signedUrl
  } catch (err) {
    console.warn('[Data/Videos] Error resolving playback URL:', err)
    return null
  }
}

export interface UploadProviderVideoInput {
  file: File
  title: string
  priceRange: string
  description: string
}

export interface UploadProviderVideoResult {
  success: boolean
  videoId?: string
  storagePath?: string
  error?: string
}

/**
 * Validates, uploads a video file to Supabase Storage, and inserts a video row into public.videos.
 * Strict ownership-based path: {auth_user_id}/{unique_file_name}
 * Initial status: 'under_review'
 */
export async function uploadProviderVideo(
  input: UploadProviderVideoInput
): Promise<UploadProviderVideoResult> {
  try {
    const { file, title, priceRange, description } = input

    // 1. Verify user authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: 'You must be signed in to upload a video.' }
    }

    // 2. Resolve authenticated user's provider record
    const { data: provider, error: provError } = await supabase
      .from('providers')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (provError || !provider) {
      return {
        success: false,
        error: 'Provider record not found for the authenticated user.',
      }
    }

    // 3. Validate selected video
    if (!file) {
      return { success: false, error: 'Please select a video file.' }
    }

    const isVideoMime = file.type.startsWith('video/')
    const hasVideoExt = /\.(mp4|webm|mov|m4v|mkv|ogg)$/i.test(file.name)
    if (!isVideoMime && !hasVideoExt) {
      return {
        success: false,
        error: 'The selected file is not a valid video. Please choose an MP4, WebM, or MOV file.',
      }
    }

    // Client-side file size limit: 50MB (52,428,800 bytes)
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: 'Video file size exceeds the 50MB limit.',
      }
    }

    // 4. Generate collision-safe ownership path: {auth_user_id}/{uuid}.{ext}
    const ext = file.name.includes('.')
      ? file.name.split('.').pop()?.toLowerCase() || 'mp4'
      : 'mp4'
    const uniqueFileName = `${crypto.randomUUID()}.${ext}`
    const storagePath = `${user.id}/${uniqueFileName}`

    // 5. Upload actual file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('provider-videos')
      .upload(storagePath, file, {
        contentType: file.type || 'video/mp4',
        upsert: false,
      })

    if (uploadError) {
      console.warn('[Data/Videos] Storage upload error:', uploadError.message)
      return { success: false, error: `Upload to storage failed: ${uploadError.message}` }
    }

    // 6. Parse price range
    const { min, max } = parsePriceRange(priceRange)

    // 7. Insert real row into public.videos
    const { data: insertedVideo, error: insertError } = await supabase
      .from('videos')
      .insert({
        provider_id: provider.id,
        title: title.trim(),
        description: description.trim(),
        min_price: min,
        max_price: max > min ? max : min,
        storage_path: storagePath,
        status: 'under_review',
      })
      .select('id, storage_path')
      .single()

    if (insertError) {
      console.warn('[Data/Videos] Database insert error:', insertError.message)
      // Clean up orphaned storage object
      await supabase.storage.from('provider-videos').remove([storagePath])
      return { success: false, error: `Failed to save video record: ${insertError.message}` }
    }

    return {
      success: true,
      videoId: insertedVideo.id,
      storagePath: insertedVideo.storage_path,
    }
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error in uploadProviderVideo:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error during video upload.',
    }
  }
}

/**
 * Admin action: Approve a video for the marketplace.
 * Enforces admin authorization via RLS and DB trigger.
 */
export async function moderateApproveVideo(
  videoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('videos')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
      })
      .eq('id', videoId)

    if (error) {
      console.warn('[Data/Videos] Error approving video:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error approving video:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Admin action: Reject a video with a reason.
 * Enforces admin authorization via RLS and DB trigger.
 */
export async function moderateRejectVideo(
  videoId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('videos')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id || null,
      })
      .eq('id', videoId)

    if (error) {
      console.warn('[Data/Videos] Error rejecting video:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.warn('[Data/Videos] Unexpected error rejecting video:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
