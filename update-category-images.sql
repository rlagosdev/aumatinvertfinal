-- SQL Script to update category images to local paths
-- Execute this in Supabase SQL Editor

-- Update Produits laitiers
UPDATE categories
SET image_url = '/categories/produits-laitiers.jpeg'
WHERE nom = 'Produits laitiers' AND type_categorie = 'epicerie';

-- Update Biscuits apéritifs
UPDATE categories
SET image_url = '/categories/biscuits-aperitifs.jpeg'
WHERE nom = 'Biscuits apéritifs' AND type_categorie = 'epicerie';

-- Update Légumes
UPDATE categories
SET image_url = '/categories/legumes.jpeg'
WHERE nom = 'Légumes' AND type_categorie = 'epicerie';

-- Update Conserves de légumes
UPDATE categories
SET image_url = '/categories/conserves-legumes.jpeg'
WHERE nom = 'Conserves de légumes' AND type_categorie = 'epicerie';

-- Update Biscuits
UPDATE categories
SET image_url = '/categories/biscuits.jpeg'
WHERE nom = 'Biscuits' AND type_categorie = 'epicerie';

-- Update Chocolats
UPDATE categories
SET image_url = '/categories/chocolats.jpeg'
WHERE nom = 'Chocolats' AND type_categorie = 'epicerie';

-- Update Confitures
UPDATE categories
SET image_url = '/categories/confitures.jpeg'
WHERE nom = 'Confitures' AND type_categorie = 'epicerie';

-- Update Fruits
UPDATE categories
SET image_url = '/categories/fruits.jpeg'
WHERE nom = 'Fruits' AND type_categorie = 'epicerie';

-- Update Jus & boissons
UPDATE categories
SET image_url = '/categories/jus-boissons.jpeg'
WHERE nom = 'Jus & boissons' AND type_categorie = 'epicerie';

-- Verify the updates
SELECT nom, image_url
FROM categories
WHERE type_categorie = 'epicerie' AND actif = true
ORDER BY position;
