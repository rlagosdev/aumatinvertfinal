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
