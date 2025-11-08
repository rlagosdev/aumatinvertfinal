-- Script SQL pour ajouter le support de plusieurs images et vidéos par produit
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer une table pour les médias des produits
CREATE TABLE IF NOT EXISTS product_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('image', 'video')),
  media_url TEXT NOT NULL,
  media_order INTEGER DEFAULT 0,
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS sur product_media
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;

-- 3. Politiques pour product_media
CREATE POLICY "Public can read product media" ON product_media FOR SELECT USING (true);
CREATE POLICY "Admins can manage product media" ON product_media FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_order ON product_media(product_id, media_order);

-- 5. Ajouter une contrainte pour limiter le nombre d'images et vidéos
-- Maximum 4 images par produit
ALTER TABLE product_media ADD CONSTRAINT max_images_per_product 
CHECK (
  CASE 
    WHEN media_type = 'image' THEN 
      (SELECT COUNT(*) FROM product_media pm WHERE pm.product_id = product_media.product_id AND pm.media_type = 'image') <= 4
    ELSE true
  END
);

-- Maximum 1 vidéo par produit
ALTER TABLE product_media ADD CONSTRAINT max_videos_per_product 
CHECK (
  CASE 
    WHEN media_type = 'video' THEN 
      (SELECT COUNT(*) FROM product_media pm WHERE pm.product_id = product_media.product_id AND pm.media_type = 'video') <= 1
    ELSE true
  END
);

-- 6. Fonction pour maintenir l'ordre des médias
CREATE OR REPLACE FUNCTION update_media_order()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER trigger_update_media_timestamp
  BEFORE UPDATE ON product_media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_order();

-- 8. Migrer les images existantes depuis la colonne image_url des produits
INSERT INTO product_media (product_id, media_type, media_url, media_order, alt_text)
SELECT 
  id as product_id,
  'image' as media_type,
  image_url as media_url,
  0 as media_order,
  nom as alt_text
FROM products 
WHERE image_url IS NOT NULL AND image_url != ''
ON CONFLICT DO NOTHING;

-- 9. Optionnel : Vous pouvez garder la colonne image_url pour la compatibilité
-- ou la supprimer avec cette commande (décommentez si vous voulez la supprimer) :
-- ALTER TABLE products DROP COLUMN IF EXISTS image_url;