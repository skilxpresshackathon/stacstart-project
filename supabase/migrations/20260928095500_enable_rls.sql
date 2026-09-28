-- ==============================================================================
-- StacStart Discover MVP — Row Level Security (RLS) & Security Policies
-- Migration: 20260928095500_enable_rls.sql
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL APPLICATION TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_submissions ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. SECURITY DEFINER HELPER FUNCTIONS
-- Using a safe search_path to prevent search_path injection and recursion.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_booking_participant(p_booking_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = p_booking_id
      AND (
        b.customer_id = auth.uid()
        OR b.provider_id IN (SELECT p.id FROM public.providers p WHERE p.profile_id = auth.uid())
      )
  );
$$;

-- ==============================================================================
-- 3. PROFILES SECURITY & POLICIES
-- Prevent role escalation via trigger and restrict access to own profile / admin.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Cannot change user role without administrator privileges';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id AND (role != 'admin' OR public.is_admin()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ==============================================================================
-- 4. PROVIDERS SECURITY & POLICIES
-- Prevent self-verification via trigger. Marketplace users can discover providers.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_provider_self_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can update provider verification status';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_provider_self_verification ON public.providers;
CREATE TRIGGER trg_prevent_provider_self_verification
  BEFORE UPDATE ON public.providers
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_provider_self_verification();

CREATE POLICY "Authenticated users can view providers"
  ON public.providers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Providers can create own provider record"
  ON public.providers FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid() AND (is_verified = false OR public.is_admin()));

CREATE POLICY "Providers can update own record or admin"
  ON public.providers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid() OR public.is_admin())
  WITH CHECK (profile_id = auth.uid() OR public.is_admin());

-- ==============================================================================
-- 5. SERVICES POLICIES
-- Marketplace can discover active services. Providers manage their own catalog.
-- ==============================================================================

CREATE POLICY "View active services or own services"
  ON public.services FOR SELECT
  TO authenticated
  USING (
    is_active = true
    OR provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Providers can create own services"
  ON public.services FOR INSERT
  TO authenticated
  WITH CHECK (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Providers can update own services"
  ON public.services FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Providers can delete own services"
  ON public.services FOR DELETE
  TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

-- ==============================================================================
-- 6. VIDEOS SECURITY & POLICIES
-- Approved videos visible to marketplace. Pending/rejected visible to owner/admin.
-- Moderation approval is restricted to admin via trigger & RLS.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_video_self_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.status IS DISTINCT FROM OLD.status) OR 
     (NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by) OR 
     (NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at) THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can moderate videos and update review fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_video_self_approval ON public.videos;
CREATE TRIGGER trg_prevent_video_self_approval
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_video_self_approval();

CREATE POLICY "View approved videos or own videos"
  ON public.videos FOR SELECT
  TO authenticated
  USING (
    status = 'approved'
    OR provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Providers can insert own videos"
  ON public.videos FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
      AND status = 'under_review'
      AND reviewed_by IS NULL
      AND reviewed_at IS NULL
    )
    OR public.is_admin()
  );

CREATE POLICY "Providers can update own videos or admin"
  ON public.videos FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Providers can delete own videos or admin"
  ON public.videos FOR DELETE
  TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

-- ==============================================================================
-- 7. BOOKINGS SECURITY & POLICIES
-- Customer ownership, provider status transitions, anti-hijacking validation.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.validate_booking_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_is_admin BOOLEAN;
  v_is_customer BOOLEAN;
  v_is_provider BOOLEAN;
BEGIN
  v_is_admin := public.is_admin();
  IF v_is_admin THEN
    RETURN NEW;
  END IF;

  -- Ensure participant ownership cannot be hijacked
  IF NEW.customer_id != OLD.customer_id OR NEW.provider_id != OLD.provider_id THEN
    RAISE EXCEPTION 'Cannot modify booking participants';
  END IF;

  v_is_customer := (auth.uid() = OLD.customer_id);
  v_is_provider := (EXISTS (SELECT 1 FROM public.providers WHERE id = OLD.provider_id AND profile_id = auth.uid()));

  -- Customers can only cancel their own bookings (from pending or accepted to canceled)
  IF v_is_customer THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF NOT (OLD.status IN ('pending', 'accepted') AND NEW.status = 'canceled') THEN
        RAISE EXCEPTION 'Customers may only cancel pending or accepted bookings';
      END IF;
    END IF;
  ELSIF v_is_provider THEN
    -- Providers can transition: pending -> accepted/declined, accepted -> in_progress, in_progress -> completed
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      IF OLD.status = 'pending' AND NEW.status NOT IN ('accepted', 'declined') THEN
        RAISE EXCEPTION 'Invalid status transition for provider from pending';
      ELSIF OLD.status = 'accepted' AND NEW.status != 'in_progress' THEN
        RAISE EXCEPTION 'Invalid status transition for provider from accepted';
      ELSIF OLD.status = 'in_progress' AND NEW.status != 'completed' THEN
        RAISE EXCEPTION 'Invalid status transition for provider from in_progress';
      ELSIF OLD.status IN ('completed', 'declined', 'canceled') THEN
        RAISE EXCEPTION 'Cannot update a closed booking';
      END IF;
    END IF;
  ELSE
    RAISE EXCEPTION 'Not authorized to update this booking';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_booking_update ON public.bookings;
CREATE TRIGGER trg_validate_booking_update
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_booking_update();

CREATE POLICY "Participants or admin can view bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    (customer_id = auth.uid() AND status = 'pending')
    OR public.is_admin()
  );

CREATE POLICY "Participants or admin can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (
    customer_id = auth.uid()
    OR provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    customer_id = auth.uid()
    OR provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

-- ==============================================================================
-- 8. MESSAGES POLICIES
-- Only booking participants can read and send messages. Messages are immutable.
-- ==============================================================================

CREATE POLICY "Booking participants or admin can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    public.is_booking_participant(booking_id)
    OR public.is_admin()
  );

CREATE POLICY "Booking participants can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND (public.is_booking_participant(booking_id) OR public.is_admin())
  );

-- ==============================================================================
-- 9. REVIEWS POLICIES
-- Customers can only review their completed bookings. Reviews visible publicly.
-- ==============================================================================

CREATE POLICY "Authenticated users can view reviews"
  ON public.reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Customers can review own completed bookings"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      customer_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_id
          AND b.customer_id = auth.uid()
          AND b.provider_id = provider_id
          AND b.status = 'completed'
      )
    )
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. VERIFICATION SUBMISSIONS SECURITY & POLICIES
-- Highly confidential NIN and document paths. Only accessible to owner and admin.
-- Self-approval strictly blocked via trigger.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.prevent_verification_self_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (NEW.status IS DISTINCT FROM OLD.status) OR
     (NEW.reviewed_by IS DISTINCT FROM OLD.reviewed_by) OR
     (NEW.reviewed_at IS DISTINCT FROM OLD.reviewed_at) THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Only administrators can update verification status and review fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_verification_self_approval ON public.verification_submissions;
CREATE TRIGGER trg_prevent_verification_self_approval
  BEFORE UPDATE ON public.verification_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_verification_self_approval();

CREATE POLICY "Providers can view own verification or admin"
  ON public.verification_submissions FOR SELECT
  TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Providers can submit verification"
  ON public.verification_submissions FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
      AND status = 'pending'
      AND reviewed_by IS NULL
      AND reviewed_at IS NULL
    )
    OR public.is_admin()
  );

CREATE POLICY "Providers can update own submission or admin"
  ON public.verification_submissions FOR UPDATE
  TO authenticated
  USING (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    provider_id IN (SELECT id FROM public.providers WHERE profile_id = auth.uid())
    OR public.is_admin()
  );
