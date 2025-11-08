-- Script de test complet pour le système de promotions
-- Exécuter dans Supabase SQL Editor

-- ========================================
-- 1. VÉRIFICATION DE TOUS LES PRODUITS AVEC PROMOTIONS
-- ========================================

SELECT
  nom,
  prix,
  promotion_active,
  prix_promotionnel,
  promotion_date_debut,
  promotion_date_fin,
  CASE
    WHEN NOT promotion_active THEN '⚪ Promotion désactivée'
    WHEN prix_promotionnel IS NULL THEN '⚠️  Prix promo manquant'
    WHEN promotion_date_debut IS NULL AND promotion_date_fin IS NULL THEN '✅ Promotion active (sans dates)'
    WHEN promotion_date_debut IS NOT NULL AND promotion_date_debut::date > CURRENT_DATE THEN '🔜 Promotion future (début: ' || promotion_date_debut::date || ')'
    WHEN promotion_date_fin IS NOT NULL AND promotion_date_fin::date < CURRENT_DATE THEN '❌ Promotion expirée (fin: ' || promotion_date_fin::date || ')'
    WHEN promotion_date_debut::date <= CURRENT_DATE AND (promotion_date_fin IS NULL OR promotion_date_fin::date >= CURRENT_DATE) THEN '✅ Promotion ACTIVE'
    ELSE '⚠️  État indéterminé'
  END as statut,
  ROUND(((prix - prix_promotionnel) / prix * 100)::numeric, 0) || '%' as reduction
FROM products
WHERE promotion_active = true
ORDER BY
  CASE
    WHEN promotion_date_debut IS NOT NULL AND promotion_date_debut::date <= CURRENT_DATE AND (promotion_date_fin IS NULL OR promotion_date_fin::date >= CURRENT_DATE) THEN 1
    WHEN promotion_date_debut IS NULL AND promotion_date_fin IS NULL THEN 2
    WHEN promotion_date_debut IS NOT NULL AND promotion_date_debut::date > CURRENT_DATE THEN 3
    ELSE 4
  END,
  nom;

-- ========================================
-- 2. DATE ACTUELLE DU SYSTÈME
-- ========================================

SELECT
  CURRENT_DATE as date_aujourdhui,
  CURRENT_TIMESTAMP as timestamp_complet,
  'Référence pour les comparaisons de dates' as note;

-- ========================================
-- 3. CORRECTION: Mettre toutes les promotions futures à aujourd'hui
-- ========================================

-- Cette requête affiche d'abord ce qui serait modifié
SELECT
  nom,
  promotion_date_debut as ancienne_date,
  CURRENT_DATE as nouvelle_date,
  'Sera mis à jour' as action
FROM products
WHERE promotion_active = true
  AND promotion_date_debut IS NOT NULL
  AND promotion_date_debut::date > CURRENT_DATE;

-- Décommentez la ligne suivante pour appliquer les changements:
-- UPDATE products
-- SET promotion_date_debut = CURRENT_DATE
-- WHERE promotion_active = true
--   AND promotion_date_debut IS NOT NULL
--   AND promotion_date_debut::date > CURRENT_DATE;

-- ========================================
-- 4. TEST SPÉCIFIQUE: Abricots Royal
-- ========================================

SELECT
  nom,
  prix || ' €' as prix_normal,
  prix_promotionnel || ' €' as prix_promo,
  promotion_active,
  promotion_date_debut,
  promotion_date_fin,
  CURRENT_DATE as aujourdhui,
  CASE
    WHEN promotion_active
      AND prix_promotionnel IS NOT NULL
      AND (promotion_date_debut IS NULL OR promotion_date_debut::date <= CURRENT_DATE)
      AND (promotion_date_fin IS NULL OR promotion_date_fin::date >= CURRENT_DATE)
    THEN '✅ DEVRAIT ÊTRE VISIBLE SUR LE SITE'
    ELSE '❌ NE SERA PAS VISIBLE'
  END as visibilite_client
FROM products
WHERE nom = 'Abricots Royal';

-- ========================================
-- 5. CRÉER UN PRODUIT DE TEST AVEC PROMOTION
-- ========================================

-- Test 1: Promotion sans dates (active immédiatement)
-- Décommentez pour créer:
/*
INSERT INTO products (
  nom, prix, categorie, actif,
  promotion_active, prix_promotionnel,
  image_url, description
) VALUES (
  'Produit Test Promo Sans Dates',
  10.00,
  'Confitures',
  true,
  true,
  7.50,
  'https://via.placeholder.com/300',
  'Produit de test avec promotion active sans dates'
);
*/

-- Test 2: Promotion avec dates (active aujourd'hui)
-- Décommentez pour créer:
/*
INSERT INTO products (
  nom, prix, categorie, actif,
  promotion_active, prix_promotionnel,
  promotion_date_debut, promotion_date_fin,
  image_url, description
) VALUES (
  'Produit Test Promo Avec Dates',
  15.00,
  'Confitures',
  true,
  true,
  11.99,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '7 days',
  'https://via.placeholder.com/300',
  'Produit de test avec promotion active pour 7 jours'
);
*/

-- ========================================
-- 6. NETTOYER LES PRODUITS DE TEST
-- ========================================

-- Pour supprimer les produits de test créés ci-dessus:
-- DELETE FROM products WHERE nom LIKE 'Produit Test Promo%';

-- ========================================
-- 7. STATISTIQUES DES PROMOTIONS
-- ========================================

SELECT
  COUNT(*) as total_produits,
  COUNT(*) FILTER (WHERE promotion_active = true) as avec_promo_activee,
  COUNT(*) FILTER (
    WHERE promotion_active = true
      AND prix_promotionnel IS NOT NULL
      AND (promotion_date_debut IS NULL OR promotion_date_debut::date <= CURRENT_DATE)
      AND (promotion_date_fin IS NULL OR promotion_date_fin::date >= CURRENT_DATE)
  ) as promos_visibles_aujourdhui,
  COUNT(*) FILTER (
    WHERE promotion_active = true
      AND promotion_date_debut IS NOT NULL
      AND promotion_date_debut::date > CURRENT_DATE
  ) as promos_futures,
  COUNT(*) FILTER (
    WHERE promotion_active = true
      AND promotion_date_fin IS NOT NULL
      AND promotion_date_fin::date < CURRENT_DATE
  ) as promos_expirees
FROM products
WHERE actif = true;
