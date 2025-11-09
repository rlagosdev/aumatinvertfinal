-- Script de correction des warnings de search_path sur les fonctions
-- Version 2 - Gestion des signatures de fonctions
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- D'abord, lister toutes les fonctions pour voir leurs signatures exactes
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  oidvectortypes(p.proargtypes) as argument_types
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

-- Maintenant corriger toutes les fonctions avec DO block pour gérer les erreurs
DO $$
DECLARE
  func_record RECORD;
  func_signature TEXT;
BEGIN
  -- Boucle sur toutes les fonctions
  FOR func_record IN
    SELECT
      n.nspname as schema,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as arguments
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
  LOOP
    BEGIN
      -- Construire la signature complète
      IF func_record.arguments = '' THEN
        func_signature := func_record.schema || '.' || func_record.function_name || '()';
      ELSE
        func_signature := func_record.schema || '.' || func_record.function_name || '(' || func_record.arguments || ')';
      END IF;

      -- Exécuter l'ALTER FUNCTION
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', func_signature);

      RAISE NOTICE 'SUCCESS: % - search_path set', func_signature;

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'ERROR: % - %', func_signature, SQLERRM;
    END;
  END LOOP;
END $$;

-- Vérification finale
SELECT
  n.nspname as schema,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE
    WHEN p.proconfig IS NULL THEN '❌ NOT SET'
    ELSE '✅ ' || array_to_string(p.proconfig, ', ')
  END as search_path_status
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
