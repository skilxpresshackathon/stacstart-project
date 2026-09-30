import { supabase } from '../supabase'

export interface AdminVerificationItem {
  id: string
  providerId: string
  providerName: string
  businessName: string
  category: string
  location: string
  nin: string
  idDocumentPath: string
  selfiePath: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string | null
  submittedAt: string
  reviewedAt?: string | null
  reviewedBy?: string | null
  phone?: string | null
  email?: string | null
}

interface RawVerificationRow {
  id: string
  provider_id: string
  nin: string
  id_document_path: string
  selfie_path: string
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason?: string | null
  submitted_at: string
  reviewed_at?: string | null
  reviewed_by?: string | null
  provider: {
    id: string
    business_name: string
    category: string
    location?: string | null
    is_verified?: boolean | null
    profile?: {
      id: string
      full_name?: string | null
      email?: string | null
      phone?: string | null
    } | null
  } | null
}

/**
 * Fetches all ID verification submissions for the admin review workflow.
 */
export async function fetchAdminVerificationSubmissions(): Promise<AdminVerificationItem[]> {
  try {
    const { data, error } = await supabase
      .from('verification_submissions')
      .select(`
        id,
        provider_id,
        nin,
        id_document_path,
        selfie_path,
        status,
        rejection_reason,
        submitted_at,
        reviewed_at,
        reviewed_by,
        provider:providers (
          id,
          business_name,
          category,
          location,
          is_verified,
          profile:profiles (
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.warn('[Data/Verification] Error fetching submissions:', error.message)
      return []
    }

    if (!data) return []

    return (data as unknown as RawVerificationRow[]).map((row) => ({
      id: row.id,
      providerId: row.provider_id,
      providerName: row.provider?.profile?.full_name || row.provider?.business_name || 'Provider',
      businessName: row.provider?.business_name || 'Unknown Business',
      category: row.provider?.category || 'General',
      location: row.provider?.location || 'Lagos, Nigeria',
      nin: row.nin,
      idDocumentPath: row.id_document_path,
      selfiePath: row.selfie_path,
      status: row.status,
      rejectionReason: row.rejection_reason,
      submittedAt: row.submitted_at,
      reviewedAt: row.reviewed_at,
      reviewedBy: row.reviewed_by,
      phone: row.provider?.profile?.phone,
      email: row.provider?.profile?.email,
    }))
  } catch (err) {
    console.warn('[Data/Verification] Unexpected error fetching submissions:', err)
    return []
  }
}

/**
 * Admin action: Approve an ID verification submission.
 * Updates verification_submissions to 'approved' and marks the provider as verified.
 */
export async function moderateApproveVerification(
  submissionId: string,
  providerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const now = new Date().toISOString()

    // 1. Update verification_submissions status to approved
    const { error: subErr } = await supabase
      .from('verification_submissions')
      .update({
        status: 'approved',
        reviewed_at: now,
        reviewed_by: user?.id || null,
      })
      .eq('id', submissionId)

    if (subErr) {
      console.warn('[Data/Verification] Error updating submission:', subErr.message)
      return { success: false, error: subErr.message }
    }

    // 2. Update provider record: is_verified = true
    const { error: provErr } = await supabase
      .from('providers')
      .update({
        is_verified: true,
      })
      .eq('id', providerId)

    if (provErr) {
      console.warn('[Data/Verification] Error updating provider verification state:', provErr.message)
      return { success: false, error: provErr.message }
    }

    return { success: true }
  } catch (err) {
    console.warn('[Data/Verification] Unexpected error approving verification:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error approving verification',
    }
  }
}

/**
 * Admin action: Reject an ID verification submission with a reason.
 * Sets status to 'rejected' and preserves provider is_verified = false.
 */
export async function moderateRejectVerification(
  submissionId: string,
  providerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const now = new Date().toISOString()

    // 1. Update verification_submissions status to rejected
    const { error: subErr } = await supabase
      .from('verification_submissions')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        reviewed_at: now,
        reviewed_by: user?.id || null,
      })
      .eq('id', submissionId)

    if (subErr) {
      console.warn('[Data/Verification] Error rejecting submission:', subErr.message)
      return { success: false, error: subErr.message }
    }

    // 2. Ensure provider remains unverified
    await supabase
      .from('providers')
      .update({
        is_verified: false,
      })
      .eq('id', providerId)

    return { success: true }
  } catch (err) {
    console.warn('[Data/Verification] Unexpected error rejecting verification:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error rejecting verification',
    }
  }
}

export const VERIFICATION_BUCKET = 'verification-documents'

/**
 * Checks if a stored verification document path is a legacy local submission
 * (i.e. not an actual physical object in Supabase Storage).
 */
export function isLegacyVerificationPath(path: string | null | undefined): boolean {
  if (!path || typeof path !== 'string') return true
  const trimmed = path.trim()
  return (
    trimmed === '' ||
    trimmed.startsWith('local_pending_storage') ||
    trimmed.includes('local_pending_storage') ||
    trimmed.startsWith('local_')
  )
}

/**
 * Uploads an actual File object to the private verification-documents bucket.
 * Follows structure: {auth_user_id}/{submission_or_uuid}/{nin|selfie}.{ext}
 */
export async function uploadVerificationDocument(
  userId: string,
  submissionId: string,
  file: File,
  docType: 'nin' | 'selfie'
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  try {
    if (!file) {
      return { success: false, error: 'No file provided.' }
    }

    // 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return { success: false, error: `${docType.toUpperCase()} file size exceeds the 10MB limit.` }
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    const hasAllowedExt = /\.(jpe?g|png|webp|pdf)$/i.test(file.name)
    if (!allowedMimes.includes(file.type) && !hasAllowedExt) {
      return {
        success: false,
        error: `${docType.toUpperCase()} must be an image (JPEG, PNG, WebP) or PDF document.`,
      }
    }

    const ext = file.name.includes('.')
      ? file.name.split('.').pop()?.toLowerCase() || 'jpg'
      : 'jpg'

    const storagePath = `${userId}/${submissionId}/${docType}.${ext}`

    const { error } = await supabase.storage
      .from(VERIFICATION_BUCKET)
      .upload(storagePath, file, {
        contentType: file.type || (ext === 'pdf' ? 'application/pdf' : 'image/jpeg'),
        upsert: true,
      })

    if (error) {
      console.warn(`[Data/Verification] Storage upload error for ${docType}:`, error.message)
      return { success: false, error: `Upload failed: ${error.message}` }
    }

    return { success: true, storagePath }
  } catch (err) {
    console.warn(`[Data/Verification] Unexpected upload error for ${docType}:`, err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown upload error',
    }
  }
}

/**
 * Removes an uploaded verification document (for cleanup if submission fails).
 */
export async function deleteVerificationDocument(storagePath: string): Promise<void> {
  try {
    if (!storagePath || isLegacyVerificationPath(storagePath)) return
    await supabase.storage.from(VERIFICATION_BUCKET).remove([storagePath])
  } catch {
    // Ignore cleanup error
  }
}

/**
 * Generates a secure, temporary signed URL for viewing a verification document in the admin dashboard.
 * Legacy submissions (e.g. local_pending_storage/...) return null.
 */
export async function getVerificationDocumentUrl(
  storagePath: string | null | undefined,
  expiresInSeconds = 3600
): Promise<string | null> {
  try {
    if (!storagePath || isLegacyVerificationPath(storagePath)) {
      return null
    }

    const { data, error } = await supabase.storage
      .from(VERIFICATION_BUCKET)
      .createSignedUrl(storagePath, expiresInSeconds)

    if (error || !data?.signedUrl) {
      return null
    }

    return data.signedUrl
  } catch {
    return null
  }
}
