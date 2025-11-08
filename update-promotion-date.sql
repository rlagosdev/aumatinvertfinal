-- Mettre à jour la date de début de promotion à aujourd'hui
-- Exécuter dans Supabase SQL Editor

-- Afficher d'abord les données actuelles
SELECT
  nom,
  prix,
  promotion_active,
  prix_promotionnel,
  promotion_date_debut,
  promotion_date_fin,
  CASE
    WHEN promotion_date_debut IS NULL THEN 'Pas de date de début'
    WHEN promotion_date_debut::date <= CURRENT_DATE THEN '✅ Promotion devrait être active'
    ELSE '❌ Promotion pas encore active (début: ' || promotion_date_debut::date || ')'
  END as statut
FROM products
WHERE nom = 'Abricots Royal';

-- Mettre à jour la date de début à aujourd'hui (07/11/2025)
UPDATE products
SET promotion_date_debut = CURRENT_DATE
WHERE nom = 'Abricots Royal';

-- Vérifier le résultat
SELECT
  nom,
  prix,
  promotion_active,
  prix_promotionnel,
  promotion_date_debut,
  promotion_date_fin,
  CURRENT_DATE as aujourdhui
FROM products
WHERE nom = 'Abricots Royal';
