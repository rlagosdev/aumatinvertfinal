-- Script de correction des warnings de search_path sur les fonctions
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. clean_old_fcm_tokens
ALTER FUNCTION public.clean_old_fcm_tokens() SET search_path = public, pg_temp;

-- 2. update_product_ranges_updated_at
ALTER FUNCTION public.update_product_ranges_updated_at() SET search_path = public, pg_temp;

-- 3. validate_promo_code
ALTER FUNCTION public.validate_promo_code(code text) SET search_path = public, pg_temp;

-- 4. update_weight_tiers_updated_at
ALTER FUNCTION public.update_weight_tiers_updated_at() SET search_path = public, pg_temp;

-- 5. update_promo_codes_updated_at
ALTER FUNCTION public.update_promo_codes_updated_at() SET search_path = public, pg_temp;

-- 6. increment_promo_code_usage
ALTER FUNCTION public.increment_promo_code_usage(code text) SET search_path = public, pg_temp;

-- 7. update_crm_contacts_updated_at
ALTER FUNCTION public.update_crm_contacts_updated_at() SET search_path = public, pg_temp;

-- 8. sync_contact_from_order
ALTER FUNCTION public.sync_contact_from_order() SET search_path = public, pg_temp;

-- 9. update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- 10. update_range_discount_tiers_updated_at
ALTER FUNCTION public.update_range_discount_tiers_updated_at() SET search_path = public, pg_temp;

-- 11. update_email_config_updated_at
ALTER FUNCTION public.update_email_config_updated_at() SET search_path = public, pg_temp;

-- 12. update_product_sections_updated_at
ALTER FUNCTION public.update_product_sections_updated_at() SET search_path = public, pg_temp;

-- 13. update_social_accounts_updated_at
ALTER FUNCTION public.update_social_accounts_updated_at() SET search_path = public, pg_temp;

-- 14. uppercase_promo_code
ALTER FUNCTION public.uppercase_promo_code() SET search_path = public, pg_temp;

-- 15. update_scheduled_posts_updated_at
ALTER FUNCTION public.update_scheduled_posts_updated_at() SET search_path = public, pg_temp;

-- 16. update_evenements_config_updated_at
ALTER FUNCTION public.update_evenements_config_updated_at() SET search_path = public, pg_temp;

-- 17. update_home_config_updated_at
ALTER FUNCTION public.update_home_config_updated_at() SET search_path = public, pg_temp;

-- 18. update_a_propos_config_updated_at
ALTER FUNCTION public.update_a_propos_config_updated_at() SET search_path = public, pg_temp;

-- 19. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;

-- 20. update_site_settings_updated_at
ALTER FUNCTION public.update_site_settings_updated_at() SET search_path = public, pg_temp;

-- 21. check_media_limits
ALTER FUNCTION public.check_media_limits() SET search_path = public, pg_temp;

-- 22. update_media_timestamp
ALTER FUNCTION public.update_media_timestamp() SET search_path = public, pg_temp;

-- Vérification - Liste toutes les fonctions et leur search_path
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE
    WHEN p.proconfig IS NULL THEN 'NOT SET'
    ELSE array_to_string(p.proconfig, ', ')
  END as search_path_setting
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'clean_old_fcm_tokens',
    'update_product_ranges_updated_at',
    'validate_promo_code',
    'update_weight_tiers_updated_at',
    'update_promo_codes_updated_at',
    'increment_promo_code_usage',
    'update_crm_contacts_updated_at',
    'sync_contact_from_order',
    'update_updated_at_column',
    'update_range_discount_tiers_updated_at',
    'update_email_config_updated_at',
    'update_product_sections_updated_at',
    'update_social_accounts_updated_at',
    'uppercase_promo_code',
    'update_scheduled_posts_updated_at',
    'update_evenements_config_updated_at',
    'update_home_config_updated_at',
    'update_a_propos_config_updated_at',
    'handle_new_user',
    'update_site_settings_updated_at',
    'check_media_limits',
    'update_media_timestamp'
  )
ORDER BY p.proname;
