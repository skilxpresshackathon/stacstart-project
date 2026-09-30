import { supabase } from '../supabase'
import type { AdminPlatformMetrics, SiteVisitDataPoint } from '../mockData'

export interface RealAdminMetrics extends AdminPlatformMetrics {
  pendingVideosCount: number
  pendingVerificationsCount: number
}

/**
 * Fetches real platform metrics from Supabase database tables:
 * - TOTAL USERS: count profiles
 * - VERIFIED USERS: count verified providers according to real DB verification state
 * - VIDEO MODERATION: count videos awaiting review (status = 'under_review')
 * - ID VERIFICATION: count pending verification submissions (status = 'pending')
 */
export async function fetchRealAdminMetrics(): Promise<RealAdminMetrics> {
  try {
    // 1. Total Users (count from public.profiles)
    const { count: totalUsersCount, error: profilesErr } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (profilesErr) {
      console.warn('[Data/Admin] Error fetching profiles count:', profilesErr.message)
    }

    // 2. Verified Users (count from public.providers where is_verified = true)
    const { count: verifiedProvidersCount, error: verifiedErr } = await supabase
      .from('providers')
      .select('*', { count: 'exact', head: true })
      .eq('is_verified', true)

    if (verifiedErr) {
      console.warn('[Data/Admin] Error fetching verified providers count:', verifiedErr.message)
    }

    // 3. Pending Videos (count from public.videos where status = 'under_review')
    const { count: pendingVideosCount, error: videosErr } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'under_review')

    if (videosErr) {
      console.warn('[Data/Admin] Error fetching pending videos count:', videosErr.message)
    }

    // 4. Pending ID Verifications (count from public.verification_submissions where status = 'pending')
    const { count: pendingVerifCount, error: verifErr } = await supabase
      .from('verification_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (verifErr) {
      console.warn('[Data/Admin] Error fetching pending verifications count:', verifErr.message)
    }

    return {
      totalUsers: totalUsersCount ?? 0,
      verifiedUsers: verifiedProvidersCount ?? 0,
      pendingVideosCount: pendingVideosCount ?? 0,
      pendingVerificationsCount: pendingVerifCount ?? 0,
    }
  } catch (err) {
    console.warn('[Data/Admin] Unexpected error in fetchRealAdminMetrics:', err)
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      pendingVideosCount: 0,
      pendingVerificationsCount: 0,
    }
  }
}

/**
 * Returns truthful site visits state for the Admin Dashboard.
 * Since visit logging is not accumulated yet, it provides a zero-baseline representation
 * without fabricating numbers.
 */
export function getTruthfulSiteVisits(): SiteVisitDataPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return days.map((day, idx) => ({
    day,
    visits: 0,
    selected: idx === 3,
  }))
}
