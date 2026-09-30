-- ==============================================================================
-- StacStart Discover MVP — Private Identity Verification Document Storage
-- Migration: 20260930120000_verification_documents_storage.sql
-- ==============================================================================

-- 1. CREATE DEDICATED PRIVATE STORAGE BUCKET FOR VERIFICATION DOCUMENTS
-- Enforces 10MB file size limit and strict image/document MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification-documents',
  'verification-documents',
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 2. STORAGE RLS POLICIES FOR verification-documents BUCKET

-- Allow authenticated providers to upload ONLY inside their own user folder: {auth_user_id}/{unique_submission_id_or_uuid}/{filename}
DROP POLICY IF EXISTS "Providers can upload own verification documents" ON storage.objects;
CREATE POLICY "Providers can upload own verification documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Allow authenticated providers to read their own documents, and allow admins to securely inspect
-- for identity verification workflows. Denies access to customers and anonymous users.
DROP POLICY IF EXISTS "Providers can read own verification documents or admins" ON storage.objects;
CREATE POLICY "Providers can read own verification documents or admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (
    split_part(name, '/', 1) = auth.uid()::text
    OR public.is_admin()
  )
);

-- Allow providers to update their own verification document objects
DROP POLICY IF EXISTS "Providers can update own verification documents" ON storage.objects;
CREATE POLICY "Providers can update own verification documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'verification-documents'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Allow providers to delete their own verification document objects or admins
DROP POLICY IF EXISTS "Providers can delete own verification documents or admins" ON storage.objects;
CREATE POLICY "Providers can delete own verification documents or admins"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (
    split_part(name, '/', 1) = auth.uid()::text
    OR public.is_admin()
  )
);
