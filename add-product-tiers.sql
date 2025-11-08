-- Ajouter la possibilité de définir des paliers de prix/quantité pour les produits

-- 1. Créer une table pour les paliers de prix
CREATE TABLE IF NOT EXISTS product_price_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL, -- Nombre de personnes (ex: 6, 9, 12)
  price DECIMAL(10, 2) NOT NULL, -- Prix pour cette quantité
  tier_order INTEGER DEFAULT 0, -- Ordre d'affichage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(product_id, quantity)
);

-- 2. Ajouter un champ au produit pour indiquer s'il utilise des paliers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'use_price_tiers'
  ) THEN
    ALTER TABLE products ADD COLUMN use_price_tiers BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3. Ajouter des commentaires
COMMENT ON TABLE product_price_tiers IS 'Paliers de prix/quantité pour les produits (ex: 6 pers = 45€, 9 pers = 65€)';
COMMENT ON COLUMN product_price_tiers.quantity IS 'Nombre de personnes pour ce palier';
COMMENT ON COLUMN product_price_tiers.price IS 'Prix pour cette quantité';
COMMENT ON COLUMN products.use_price_tiers IS 'Si true, le produit utilise des paliers de prix au lieu du prix unique';

-- 4. Index pour performance
CREATE INDEX IF NOT EXISTS idx_product_price_tiers_product_id ON product_price_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_product_price_tiers_tier_order ON product_price_tiers(product_id, tier_order);

-- 5. Exemple de données pour tester
-- Créer un produit exemple avec des paliers
-- INSERT INTO products (nom, categorie, prix, retrait_planifie, use_price_tiers, actif)
-- VALUES ('Plateau apéritif', 'Plateaux', 45.00, true, true, true)
-- RETURNING id;

-- Ensuite ajouter les paliers (remplacer 'PRODUCT_ID' par l'ID du produit créé)
-- INSERT INTO product_price_tiers (product_id, quantity, price, tier_order) VALUES
-- ('PRODUCT_ID', 6, 45.00, 1),
-- ('PRODUCT_ID', 9, 65.00, 2),
-- ('PRODUCT_ID', 12, 85.00, 3);

-- Vérifier les paliers
SELECT
  p.nom,
  p.use_price_tiers,
  pt.quantity as personnes,
  pt.price as prix,
  pt.tier_order
FROM products p
LEFT JOIN product_price_tiers pt ON p.id = pt.product_id
WHERE p.use_price_tiers = true
ORDER BY p.nom, pt.tier_order;
