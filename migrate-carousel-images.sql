-- Migration des images du carrousel codées en dur vers la base de données
-- Exécutez ce script dans le SQL Editor de Supabase

-- Pour la catégorie "Produits laitiers"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers.jpeg', 0
FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers-2.jpeg', 1
FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers-3.jpeg', 2
FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers-4.jpeg', 3
FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Fruits"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/fruits.jpeg', 0
FROM categories WHERE nom = 'Fruits'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/fruits-2.jpeg', 1
FROM categories WHERE nom = 'Fruits'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/fruits-3.jpeg', 2
FROM categories WHERE nom = 'Fruits'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Confitures"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/confitures.jpeg', 0
FROM categories WHERE nom = 'Confitures'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/confitures-2.jpeg', 1
FROM categories WHERE nom = 'Confitures'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Biscuits apéritifs"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/biscuits-aperitifs.jpeg', 0
FROM categories WHERE nom = 'Biscuits apéritifs'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/biscuits-aperitifs-2.jpeg', 1
FROM categories WHERE nom = 'Biscuits apéritifs'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Alternatives café"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/alternatives-cafe.jpeg', 0
FROM categories WHERE nom = 'Alternatives café'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Légumes"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/legumes.jpeg', 0
FROM categories WHERE nom = 'Légumes'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Conserves de légumes"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/conserves-legumes.jpeg', 0
FROM categories WHERE nom = 'Conserves de légumes'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Biscuits"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/biscuits.jpeg', 0
FROM categories WHERE nom = 'Biscuits'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Chocolats"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/chocolats.jpeg', 0
FROM categories WHERE nom = 'Chocolats'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Conserves de poisson"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/conserves-poisson.jpeg', 0
FROM categories WHERE nom = 'Conserves de poisson'
ON CONFLICT (category_id, position) DO NOTHING;

-- Pour la catégorie "Jus & boissons"
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/jus-boissons.jpeg', 0
FROM categories WHERE nom = 'Jus & boissons'
ON CONFLICT (category_id, position) DO NOTHING;

-- Vérifier le résultat
SELECT
  c.nom as categorie,
  COUNT(cci.id) as nombre_images
FROM categories c
LEFT JOIN category_carousel_images cci ON c.id = cci.category_id
GROUP BY c.nom, c.id
ORDER BY c.nom;
