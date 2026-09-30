-- ==============================================================================
-- StacStart Discover MVP — Public Marketplace Read Access & Video Playback
-- Migration: 20260930190000_public_marketplace_read.sql
-- ==============================================================================

-- 1. VIDEOS: Allow anonymous users to view approved videos ONLY
-- Ensures anonymous marketplace visitors can discover approved videos, while
-- rejected and under_review videos remain strictly protected and hidden.
DROP POLICY IF EXISTS "Public can view approved videos" ON public.videos;
CREATE POLICY "Public can view approved videos"
  ON public.videos FOR SELECT
  TO anon
  USING (status = 'approved');

-- 2. PROVIDERS: Allow anonymous users to view provider business directory
DROP POLICY IF EXISTS "Public can view providers" ON public.providers;
CREATE POLICY "Public can view providers"
  ON public.providers FOR SELECT
  TO anon
  USING (true);

-- 3. SERVICES: Allow anonymous users to view active services
DROP POLICY IF EXISTS "Public can view active services" ON public.services;
CREATE POLICY "Public can view active services"
  ON public.services FOR SELECT
  TO anon
  USING (is_active = true);

-- 4. REVIEWS: Allow anonymous users to view customer reviews
DROP POLICY IF EXISTS "Public can view reviews" ON public.reviews;
CREATE POLICY "Public can view reviews"
  ON public.reviews FOR SELECT
  TO anon
  USING (true);
