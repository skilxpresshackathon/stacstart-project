-- ==============================================================================
-- StacStart Discover MVP — Auth Profiles Trigger & Provider Registration RPC
-- Migration: 20260928100500_auth_profiles_trigger.sql
-- ==============================================================================

-- 1. AUTOMATIC PROFILE CREATION TRIGGER
-- Synchronizes auth.users inserts with public.profiles safely.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  -- Strict role validation: only 'customer' or 'provider' allowed from user metadata
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  IF v_role NOT IN ('customer', 'provider') THEN
    v_role := 'customer';
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  v_phone := NEW.raw_user_meta_data->>'phone';

  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    v_full_name,
    NEW.email,
    v_phone,
    v_role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. CONTROLLED PROVIDER REGISTRATION & ROLE TRANSITION RPC
-- Allows authenticated users to safely transition to provider without privilege escalation.
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
    p_services,
    (SELECT phone FROM public.profiles WHERE id = v_user_id),
    false
  )
  ON CONFLICT (profile_id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    bio = EXCLUDED.bio,
    updated_at = timezone('utc'::text, now())
  RETURNING id INTO v_provider_id;

  -- 3. Insert verification submission
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

-- 3. PERMIT CONTROLLED CUSTOMER -> PROVIDER TRANSITION WHILE STRICTLY FORBIDDING ADMIN ESCALATION
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Strict escalation check: Only admins can assign or assume the 'admin' role
  IF (NEW.role = 'admin' OR OLD.role = 'admin') AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Cannot assign or modify administrator role without administrator privileges';
  END IF;
  RETURN NEW;
END;
$$;

