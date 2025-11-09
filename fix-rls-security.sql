-- Script de correction des problèmes de sécurité RLS
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Activer RLS sur la table commandes
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

-- 2. Activer RLS sur product_weight_tiers
ALTER TABLE public.product_weight_tiers ENABLE ROW LEVEL SECURITY;

-- 3. Activer RLS sur product_price_tiers
ALTER TABLE public.product_price_tiers ENABLE ROW LEVEL SECURITY;

-- 4. Créer une politique de lecture publique pour product_weight_tiers
DROP POLICY IF EXISTS "Allow public read access" ON public.product_weight_tiers;
CREATE POLICY "Allow public read access" ON public.product_weight_tiers
  FOR SELECT USING (true);

-- 5. Créer une politique de lecture publique pour product_price_tiers
DROP POLICY IF EXISTS "Allow public read access" ON public.product_price_tiers;
  FOR SELECT USING (true);

-- Note: La table commandes a déjà des politiques définies, donc pas besoin d'en créer de nouvelles

-- Vérification
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('commandes', 'product_weight_tiers', 'product_price_tiers')
ORDER BY tablename;
