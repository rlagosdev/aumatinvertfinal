# Migration du Carrousel de Catégories - Instructions Finales

## Ce qui a été fait

✅ **1. Création de la table `category_carousel_images`**
   - Table pour stocker les images du carrousel
   - Politiques de sécurité configurées

✅ **2. Interface d'administration mise à jour**
   - Section "Images du carrousel" dans l'édition des catégories
   - Ajout, suppression et réorganisation des images

✅ **3. Affichage frontend modifié**
   - Les images sont maintenant chargées depuis la base de données
   - Les images codées en dur ont été retirées du code

## Actions à effectuer dans Supabase

### Étape 1 : Créer la table (si pas déjà fait)

Allez dans **SQL Editor** et exécutez :

```sql
-- Table pour stocker les images du carrousel des catégories
CREATE TABLE IF NOT EXISTS category_carousel_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, position)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_category_carousel_category_id ON category_carousel_images(category_id);
CREATE INDEX IF NOT EXISTS idx_category_carousel_position ON category_carousel_images(category_id, position);

-- Enable RLS (Row Level Security)
ALTER TABLE category_carousel_images ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique
CREATE POLICY "Allow public read access" ON category_carousel_images
  FOR SELECT USING (true);

-- Policy pour permettre l'insertion aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated insert" ON category_carousel_images
  FOR INSERT TO authenticated WITH CHECK (true);

-- Policy pour permettre la mise à jour aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated update" ON category_carousel_images
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Policy pour permettre la suppression aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated delete" ON category_carousel_images
  FOR DELETE TO authenticated USING (true);
```

### Étape 2 : Migrer les images existantes

Exécutez ce SQL pour transférer toutes les images actuellement codées en dur :

```sql
-- Migration des images du carrousel
INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers.jpeg', 0 FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers-2.jpeg', 1 FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers-3.jpeg', 2 FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/produits-laitiers-4.jpeg', 3 FROM categories WHERE nom = 'Produits laitiers'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/fruits.jpeg', 0 FROM categories WHERE nom = 'Fruits'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/fruits-2.jpeg', 1 FROM categories WHERE nom = 'Fruits'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/fruits-3.jpeg', 2 FROM categories WHERE nom = 'Fruits'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/confitures.jpeg', 0 FROM categories WHERE nom = 'Confitures'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/confitures-2.jpeg', 1 FROM categories WHERE nom = 'Confitures'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/biscuits-aperitifs.jpeg', 0 FROM categories WHERE nom = 'Biscuits apéritifs'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/biscuits-aperitifs-2.jpeg', 1 FROM categories WHERE nom = 'Biscuits apéritifs'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/alternatives-cafe.jpeg', 0 FROM categories WHERE nom = 'Alternatives café'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/legumes.jpeg', 0 FROM categories WHERE nom = 'Légumes'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/conserves-legumes.jpeg', 0 FROM categories WHERE nom = 'Conserves de légumes'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/biscuits.jpeg', 0 FROM categories WHERE nom = 'Biscuits'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/chocolats.jpeg', 0 FROM categories WHERE nom = 'Chocolats'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/conserves-poisson.jpeg', 0 FROM categories WHERE nom = 'Conserves de poisson'
ON CONFLICT (category_id, position) DO NOTHING;

INSERT INTO category_carousel_images (category_id, image_url, position)
SELECT id, '/categories/jus-boissons.jpeg', 0 FROM categories WHERE nom = 'Jus & boissons'
ON CONFLICT (category_id, position) DO NOTHING;
```

### Étape 3 : Vérifier la migration

Exécutez cette requête pour voir combien d'images ont été migrées :

```sql
SELECT
  c.nom as categorie,
  COUNT(cci.id) as nombre_images
FROM categories c
LEFT JOIN category_carousel_images cci ON c.id = cci.category_id
GROUP BY c.nom, c.id
ORDER BY c.nom;
```

## Utilisation de la nouvelle fonctionnalité

1. Allez dans **Administration > Gestion des Catégories**
2. Cliquez sur **Modifier** (icône crayon) sur une catégorie
3. Descendez jusqu'à la section **"Images du carrousel"**
4. Vous verrez toutes les images migrées et pourrez :
   - ✓ Ajouter de nouvelles images
   - ✓ Supprimer des images existantes
   - ✓ Réorganiser l'ordre avec les flèches ↑ ↓

## Important

⚠️ Après avoir exécuté les deux scripts SQL ci-dessus, toutes vos images actuelles seront gérables depuis l'interface admin et visibles côté client !
