-- Script pour corriger les positions du carrousel et éviter les erreurs
-- Ce script réindexe toutes les positions à partir de 0

-- Temporairement désactiver la contrainte unique
ALTER TABLE category_carousel_images DROP CONSTRAINT IF EXISTS category_carousel_images_category_id_position_key;

-- Réindexer les positions pour chaque catégorie
WITH numbered_images AS (
  SELECT
    id,
    category_id,
    ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY position) - 1 as new_position
  FROM category_carousel_images
)
UPDATE category_carousel_images
SET position = numbered_images.new_position
FROM numbered_images
WHERE category_carousel_images.id = numbered_images.id;

-- Réactiver la contrainte unique
ALTER TABLE category_carousel_images
ADD CONSTRAINT category_carousel_images_category_id_position_key
UNIQUE (category_id, position);

-- Vérifier le résultat
SELECT
  c.nom as categorie,
  cci.image_url,
  cci.position
FROM category_carousel_images cci
JOIN categories c ON c.id = cci.category_id
ORDER BY c.nom, cci.position;
