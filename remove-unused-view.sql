-- Script pour supprimer la vue user_posts_summary non utilisée
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- Vérifier d'abord ce que contient la vue
SELECT pg_get_viewdef('public.user_posts_summary'::regclass, true) as view_definition;

-- Supprimer la vue
DROP VIEW IF EXISTS public.user_posts_summary CASCADE;

-- Vérifier que la vue a bien été supprimée
SELECT
  schemaname,
  viewname,
  viewowner
FROM pg_views
WHERE schemaname = 'public'
  AND viewname = 'user_posts_summary';

-- Si aucune ligne n'est retournée, la vue a bien été supprimée ✅
