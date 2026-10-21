-- Supabase security advisor remediation (project qlasxtfbodyxbcuchvxz).
-- Views: enable security_invoker where underlying RLS allows public reads.
-- Functions: revoke RPC EXECUTE from anon/authenticated on trigger-only helpers;
--   tighten redeem RPCs; pin search_path on flagged trigger helpers.

-- ---------------------------------------------------------------------------
-- 1. Views
-- ---------------------------------------------------------------------------

-- canonical_flies: approved flies are already public via flies_read_approved RLS.
DROP VIEW IF EXISTS public.canonical_flies;

CREATE VIEW public.canonical_flies
  WITH (security_invoker = true) AS
SELECT
  id,
  slug,
  name,
  category,
  description,
  hero_image_url,
  NULL::text AS tagline,
  NULL::integer AS rank,
  is_featured AS featured,
  option_envelope -> 'sizes'::text AS sizes,
  option_envelope #> '{colors,body}'::text[] AS colors,
  (option_envelope -> 'bead'::text) -> 'sizes_mm'::text AS bead_options,
  NULL::text[] AS hook_styles,
  materials_list,
  history,
  tying_overview,
  fishing_tips,
  imitates,
  effective_species_ids,
  water_types,
  inspired_by_fly_id AS contributed_by_user_id,
  origin_credit,
  created_at,
  updated_at
FROM public.flies
WHERE status = 'approved'::text;

GRANT SELECT ON public.canonical_flies TO authenticated, anon, service_role;

COMMENT ON VIEW public.canonical_flies IS
  'Read-only compatibility view over approved flies. security_invoker=on: relies on flies_read_approved RLS.';

-- session_presence, river_activity_stats, promo_code_availability intentionally
-- remain SECURITY DEFINER (security_invoker off / default definer). See PR.

COMMENT ON VIEW public.session_presence IS
  'Public presence ribbon (broadcast_presence only). SECURITY DEFINER required: fishing_sessions SELECT is owner-only; invoker would hide other anglers.';

COMMENT ON VIEW public.river_activity_stats IS
  'River activity aggregates over broadcast_presence sessions. SECURITY DEFINER required: owner-only RLS on fishing_sessions and catches.';

COMMENT ON VIEW public.promo_code_availability IS
  'Aggregate promo seat counts. SECURITY DEFINER required: promo_codes has RLS with no client SELECT policies.';

-- ---------------------------------------------------------------------------
-- 2. Redeem RPCs: enforce p_user_id = auth.uid() (service role exempt)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_user_id uuid, p_code text)
RETURNS TABLE(status text, premium_until timestamp with time zone, remaining integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $function$
DECLARE
    v_code      promo_codes%ROWTYPE;
    v_count     INTEGER;
    v_until     TIMESTAMPTZ;
    v_existing  TIMESTAMPTZ;
BEGIN
    IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'p_user_id must match auth.uid()'
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_code FROM promo_codes
      WHERE code = upper(trim(p_code))
        AND now() >= active_from
        AND (active_until IS NULL OR now() < active_until);
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'invalid_code'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    SELECT promo_redemptions.premium_until INTO v_existing
      FROM promo_redemptions
      WHERE promo_redemptions.code_id = v_code.id
        AND promo_redemptions.user_id = p_user_id;
    IF v_existing IS NOT NULL THEN
        RETURN QUERY SELECT 'already_redeemed'::TEXT, v_existing, 0;
        RETURN;
    END IF;

    IF EXISTS (
      SELECT 1 FROM subscriptions
        WHERE subscriptions.user_id = p_user_id
          AND subscriptions.status IN ('active','trialing')
          AND (subscriptions.current_period_end IS NULL
               OR subscriptions.current_period_end > now())
          AND subscriptions.source <> 'promo'
    ) THEN
        RETURN QUERY SELECT 'already_premium'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    LOCK TABLE promo_redemptions IN EXCLUSIVE MODE;

    SELECT COUNT(*) INTO v_count
      FROM promo_redemptions
      WHERE promo_redemptions.code_id = v_code.id;

    IF v_count >= v_code.max_redemptions THEN
        RETURN QUERY SELECT 'sold_out'::TEXT, NULL::TIMESTAMPTZ, 0;
        RETURN;
    END IF;

    v_until := now() + (v_code.duration_days || ' days')::INTERVAL;

    INSERT INTO promo_redemptions (code_id, user_id, premium_until)
      VALUES (v_code.id, p_user_id, v_until);

    INSERT INTO subscriptions (
        user_id, source, external_id, plan, status, current_period_end
    ) VALUES (
        p_user_id, 'promo', v_code.code,
        'promo_' || v_code.duration_days || 'd', 'active', v_until
    )
    ON CONFLICT (user_id, source) DO UPDATE
      SET status = 'active',
          current_period_end = EXCLUDED.current_period_end,
          external_id = EXCLUDED.external_id,
          plan = EXCLUDED.plan,
          updated_at = now();

    RETURN QUERY SELECT 'ok'::TEXT, v_until, (v_code.max_redemptions - v_count - 1);
END;
$function$;

CREATE OR REPLACE FUNCTION public.redeem_gift_token(p_user_id uuid, p_token text)
RETURNS TABLE(status text, premium_until timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public, pg_temp
AS $function$
DECLARE
    v_gift   gift_redemptions%ROWTYPE;
    v_until  TIMESTAMPTZ;
BEGIN
    IF auth.uid() IS NOT NULL AND p_user_id IS DISTINCT FROM auth.uid() THEN
        RAISE EXCEPTION 'p_user_id must match auth.uid()'
            USING ERRCODE = '42501';
    END IF;

    SELECT * INTO v_gift FROM gift_redemptions
      WHERE token = p_token
      FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 'invalid_token'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_gift.redeemed_at IS NOT NULL THEN
        RETURN QUERY SELECT 'already_redeemed'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    IF v_gift.purchaser_user_id IS NOT NULL
       AND v_gift.purchaser_user_id = p_user_id THEN
        RETURN QUERY SELECT 'own_gift'::TEXT, NULL::TIMESTAMPTZ;
        RETURN;
    END IF;

    v_until := now() + INTERVAL '1 year';

    UPDATE gift_redemptions
       SET redeemed_by_user_id = p_user_id,
           redeemed_at = now()
     WHERE id = v_gift.id;

    INSERT INTO subscriptions (
        user_id, source, external_id, plan, status, current_period_end
    ) VALUES (
        p_user_id, 'gift', v_gift.token,
        'gift_annual', 'active', v_until
    )
    ON CONFLICT (user_id, source) DO UPDATE
      SET status = 'active',
          current_period_end = EXCLUDED.current_period_end,
          external_id = EXCLUDED.external_id,
          plan = EXCLUDED.plan,
          updated_at = now();

    RETURN QUERY SELECT 'ok'::TEXT, v_until;
END;
$function$;

REVOKE ALL ON FUNCTION public.redeem_promo_code(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_promo_code(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_promo_code(uuid, text) TO service_role;

REVOKE ALL ON FUNCTION public.redeem_gift_token(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.redeem_gift_token(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.redeem_gift_token(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_gift_token(uuid, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 3. RPC EXECUTE grants (trigger-only and unused RPC helpers)
-- ---------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.enforce_dm_trust() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_dm_trust() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.enforce_follow_trust() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_follow_trust() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.prevent_new_account_broadcast() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_new_account_broadcast() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.user_blocks_wipe_follows() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.user_blocks_wipe_follows() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.update_premium_from_subscriptions() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_premium_from_subscriptions() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.update_profile_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_profile_stats() FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.is_blocked(uuid, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.is_blocked(uuid, uuid) TO authenticated;

-- river_whats_working: authenticated-only per original migration; not used from web.
REVOKE EXECUTE ON FUNCTION public.river_whats_working(text, integer) FROM anon;

-- river_fly_pulse and river_trip_reports: keep anon + authenticated (web static
-- client and public river intel; mobile clients may call the same RPCs).

REVOKE ALL ON FUNCTION public.river_fly_pulse(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_fly_pulse(text) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.river_trip_reports(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_trip_reports(text, integer) TO anon, authenticated;

REVOKE ALL ON FUNCTION public.river_whats_working(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.river_whats_working(text, integer) TO authenticated;

-- ---------------------------------------------------------------------------
-- 4. Pin search_path on advisor-flagged functions (mutable search_path)
-- ---------------------------------------------------------------------------

ALTER FUNCTION public.auto_enable_rls() SET search_path = public, pg_temp;
ALTER FUNCTION public.compute_material_slot_from_ingredient(fly_recipe_ingredients, tying_materials) SET search_path = public, pg_temp;
ALTER FUNCTION public.compute_materials_list_for_fly(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.flag_founders_free_signup() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_minion_job_change() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_is_private_from_visibility() SET search_path = public, pg_temp;
ALTER FUNCTION public.sync_materials_list_from_ingredients() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_chunk_search_vector() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_contributor_trust() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_device_tokens_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_flies_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_fly_boxes_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_page_search_vector() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_phase2_fly_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_premium_from_subscriptions() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_profile_stats() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_submission_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
