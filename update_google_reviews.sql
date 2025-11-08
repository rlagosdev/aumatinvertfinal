-- =====================================================
-- MISE À JOUR DES AVIS GOOGLE
-- Note globale : 4.6/5
-- Nombre total d'avis : 25
-- Format des dates : Mois et année seulement
-- =====================================================

-- 1. Mettre à jour la configuration (si la table existe)
-- Cette requête n'affecte pas directement l'affichage car le code calcule la moyenne
-- Mais on peut ajouter une note moyenne fixe dans la config si nécessaire

-- Vérifier d'abord si la table google_reviews_config existe
-- SELECT * FROM google_reviews_config;

-- Si vous voulez ajouter une colonne pour la note fixe (optionnel)
-- ALTER TABLE google_reviews_config ADD COLUMN IF NOT EXISTS fixed_rating DECIMAL(2,1);
-- ALTER TABLE google_reviews_config ADD COLUMN IF NOT EXISTS total_reviews_count INTEGER;

-- UPDATE google_reviews_config
-- SET fixed_rating = 4.6,
--     total_reviews_count = 25
-- WHERE id = 1;


-- 2. Modifier les dates des avis existants
-- On ne change que le format d'affichage dans le code, mais on peut aussi
-- s'assurer que les dates sont correctes dans la base

-- Voir tous les avis actuels
SELECT id, author_name, rating, review_date, is_active
FROM google_reviews
ORDER BY display_order DESC, review_date DESC;

-- Si vous voulez mettre à jour des dates spécifiques, utilisez :
-- UPDATE google_reviews
-- SET review_date = '2024-08-01'  -- Remplacer par la date souhaitée (année-mois-jour)
-- WHERE id = 'ID_DE_L_AVIS';


-- 3. SOLUTION SIMPLE : Modifier directement le code React
-- La meilleure solution est de modifier le fichier GoogleReviewsDisplay.tsx
-- pour forcer la note à 4.6 et le nombre d'avis à 25

-- Voici ce qu'il faut changer dans le code (lignes 84-87) :
-- const averageRating = '4.6';
-- const totalReviews = 25;

-- Et pour le format de date (lignes 110-115) :
-- const formatDate = (dateString: string) => {
--   const date = new Date(dateString);
--   return new Intl.DateTimeFormat('fr-FR', {
--     year: 'numeric',
--     month: 'long'
--   }).format(date);
-- };


-- =====================================================
-- ALTERNATIVE : Créer une vue pour forcer les valeurs
-- =====================================================

-- Créer une fonction qui retourne toujours 4.6 comme moyenne
CREATE OR REPLACE FUNCTION get_google_reviews_average()
RETURNS DECIMAL(2,1) AS $$
BEGIN
  RETURN 4.6;
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction qui retourne toujours 25 comme total
CREATE OR REPLACE FUNCTION get_google_reviews_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN 25;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- VÉRIFICATION
-- =====================================================

-- Vérifier le nombre d'avis actifs
SELECT COUNT(*) as avis_actifs FROM google_reviews WHERE is_active = true;

-- Vérifier la moyenne actuelle
SELECT AVG(rating)::DECIMAL(2,1) as moyenne_actuelle
FROM google_reviews
WHERE is_active = true;

-- Voir tous les avis avec leurs dates
SELECT
  author_name,
  rating,
  TO_CHAR(review_date, 'Month YYYY') as date_formatee,
  is_active
FROM google_reviews
WHERE is_active = true
ORDER BY display_order DESC, review_date DESC;
