# Instructions pour activer la gestion du carrousel de catégories

## Étape 1 : Créer la table dans Supabase

1. Connectez-vous à votre dashboard Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur "SQL Editor"
4. Cliquez sur "New query"
5. Copiez et collez le SQL suivant :

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

6. Cliquez sur "Run" pour exécuter le SQL

## Étape 2 : Utiliser la nouvelle fonctionnalité

Une fois la table créée :

1. Connectez-vous à votre interface d'administration
2. Allez dans "Gestion des Catégories"
3. Cliquez sur le bouton "Modifier" (icône crayon) d'une catégorie existante
4. Une nouvelle section "Images du carrousel" apparaîtra en bas du formulaire
5. Vous pouvez :
   - Ajouter des images au carrousel en cliquant sur "Ajouter au carrousel"
   - Réorganiser les images avec les flèches haut/bas
   - Supprimer des images avec le bouton X rouge

## Fonctionnement

- Les images du carrousel s'affichent automatiquement sur les cartes de catégories
- Si aucune image n'est dans le carrousel, les images par défaut (codées en dur) seront affichées
- Les utilisateurs peuvent naviguer entre les images avec les flèches sur les cartes
- Les points en bas des cartes indiquent le nombre d'images et la position actuelle

## Note importante

Vous devez d'abord créer ou modifier une catégorie pour avoir accès à l'édition du carrousel. La gestion du carrousel n'est disponible que lors de la modification d'une catégorie existante, pas lors de la création d'une nouvelle.
