-- Mettre à jour la date de début de promotion pour test
-- Exécuter dans Supabase SQL Editor

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
  promotion_date_fin
FROM products
WHERE nom = 'Abricots Royal';
