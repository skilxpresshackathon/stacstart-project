-- ==============================================================================
-- StacStart Discover MVP — Reviews & Provider Services Integration
-- Migration: 20260928114500_reviews_and_provider_services.sql
-- ==============================================================================

-- 1. SECURE FUNCTION TO RETRIEVE REVIEWS WITH REVIEWER DISPLAY IDENTITY
-- Exposes ONLY display name and avatar without exposing private profile fields
-- (email, phone, role remain protected under profiles RLS).
CREATE OR REPLACE FUNCTION public.get_provider_reviews(p_provider_id UUID)
RETURNS TABLE (
  id UUID,
  provider_id UUID,
  rating NUMERIC(2, 1),
  comment TEXT,
  created_at TIMESTAMPTZ,
  reviewer_name TEXT,
  reviewer_avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT
    r.id,
    r.provider_id,
    r.rating,
    r.comment,
    r.created_at,
    COALESCE(p.full_name, 'Verified Customer') AS reviewer_name,
    p.avatar_url AS reviewer_avatar_url
  FROM public.reviews r
  LEFT JOIN public.profiles p ON p.id = r.customer_id
  WHERE r.provider_id = p_provider_id
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_provider_reviews(UUID) TO anon, authenticated;

-- 2. UPDATE register_as_provider TO CREATE REAL SERVICE RECORDS IN public.services
CREATE OR REPLACE FUNCTION public.register_as_provider(
  p_business_name TEXT,
  p_category TEXT,
  p_services TEXT,
  p_location TEXT,
  p_nin TEXT,
  p_id_document_path TEXT,
  p_selfie_path TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_provider_id UUID;
  v_service_name TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Upgrade user role to provider in profiles (controlled upgrade, never admin)
  UPDATE public.profiles
  SET role = 'provider',
      updated_at = timezone('utc'::text, now())
  WHERE id = v_user_id;

  -- 2. Insert or update provider record
  INSERT INTO public.providers (profile_id, business_name, category, location, bio, phone, is_verified)
  VALUES (
    v_user_id,
    p_business_name,
    p_category,
    p_location,
    'Professional ' || p_category || ' based in ' || p_location || '.',
    (SELECT phone FROM public.profiles WHERE id = v_user_id),
    false
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    updated_at = timezone('utc'::text, now())
  RETURNING id INTO v_provider_id;

  -- 3. Create service rows in public.services from submitted p_services
  IF p_services IS NOT NULL AND trim(p_services) != '' THEN
    FOR v_service_name IN
      SELECT trim(s)
      FROM regexp_split_to_table(p_services, '[\r\n,;]+') AS s
      WHERE trim(s) != ''
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM public.services
        WHERE provider_id = v_provider_id AND lower(name) = lower(v_service_name)
      ) THEN
        INSERT INTO public.services (
          provider_id,
          name,
          category,
          min_price,
          price_type,
          is_active
        )
        VALUES (
          v_provider_id,
          v_service_name,
          p_category,
          0,
          'negotiable',
          true
        );
      END IF;
    END LOOP;
  END IF;

  -- 4. Insert verification submission
  INSERT INTO public.verification_submissions (provider_id, nin, id_document_path, selfie_path, status)
  VALUES (
    v_provider_id,
    p_nin,
    p_id_document_path,
    p_selfie_path,
    'pending'
  );

  RETURN jsonb_build_object(
    'success', true,
    'provider_id', v_provider_id,
    'role', 'provider'
  );
END;
$$;
