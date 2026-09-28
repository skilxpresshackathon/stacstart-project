-- ==============================================================================
-- StacStart Discover MVP — Provider Video Storage & Upload Integration
-- Migration: 20260928140000_provider_video_storage.sql
-- ==============================================================================

-- 1. ADD storage_path TO public.videos
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS storage_path TEXT;
CREATE INDEX IF NOT EXISTS idx_videos_storage_path ON public.videos(storage_path);

-- 2. CREATE DEDICATED PRIVATE STORAGE BUCKET FOR PROVIDER VIDEOS
-- Enforces 50MB file size limit and video MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'provider-videos',
  'provider-videos',
  false,
  52428800, -- 50MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'video/ogg'];

-- 3. STORAGE RLS POLICIES FOR provider-videos BUCKET

-- Allow authenticated providers to upload ONLY inside their own user folder: {auth_user_id}/{filename}
DROP POLICY IF EXISTS "Providers can upload own videos" ON storage.objects;
CREATE POLICY "Providers can upload own videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'provider-videos'
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.providers
    WHERE profile_id = auth.uid()
  )
);

-- Allow authenticated providers to read their own videos, allow admins to read for moderation,
-- and allow access for approved videos
DROP POLICY IF EXISTS "Providers can read own videos or admin or approved" ON storage.objects;
CREATE POLICY "Providers can read own videos or admin or approved"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (
  bucket_id = 'provider-videos'
  AND (
    split_part(name, '/', 1) = auth.uid()::text
    OR public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.videos v
      WHERE v.storage_path = name AND v.status = 'approved'
    )
  )
);

-- Allow providers to update their own video objects
DROP POLICY IF EXISTS "Providers can update own video objects" ON storage.objects;
CREATE POLICY "Providers can update own video objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'provider-videos'
  AND split_part(name, '/', 1) = auth.uid()::text
  AND EXISTS (
    SELECT 1 FROM public.providers WHERE profile_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'provider-videos'
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Allow providers to delete their own video objects or admins
DROP POLICY IF EXISTS "Providers can delete own video objects" ON storage.objects;
CREATE POLICY "Providers can delete own video objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'provider-videos'
  AND (
    split_part(name, '/', 1) = auth.uid()::text
    OR public.is_admin()
  )
);

-- 4. UPDATE ROLE ESCALATION TRIGGER TO ALLOW DIRECT POSTGRES / DBA UPDATES
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Direct SQL / DBA execution has auth.uid() IS NULL
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Strict escalation check: Only admins can assign or assume the 'admin' role
  IF (NEW.role = 'admin' OR OLD.role = 'admin') AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Cannot assign or modify administrator role without administrator privileges';
  END IF;
  RETURN NEW;
END;
$$;
