-- Création de la table person_price_tiers si elle n'existe pas
CREATE TABLE IF NOT EXISTS person_price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_persons INTEGER NOT NULL CHECK (min_persons > 0),
  max_persons INTEGER CHECK (max_persons IS NULL OR max_persons >= min_persons),
  price_per_person DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tier_order INTEGER NOT NULL DEFAULT 1,
  discount_type VARCHAR(10) DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
  discount_percentage DECIMAL(5, 2) CHECK (discount_percentage IS NULL OR (discount_percentage >= 0 AND discount_percentage <= 100)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_person_price_tiers_product_id ON person_price_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_person_price_tiers_tier_order ON person_price_tiers(product_id, tier_order);

-- RLS (Row Level Security) pour sécuriser l'accès
ALTER TABLE person_price_tiers ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique (pour le site client)
CREATE POLICY IF NOT EXISTS "Allow public read access" ON person_price_tiers
  FOR SELECT USING (true);

-- Policy pour permettre l'insertion/modification/suppression aux administrateurs uniquement
CREATE POLICY IF NOT EXISTS "Allow authenticated insert" ON person_price_tiers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated update" ON person_price_tiers
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Allow authenticated delete" ON person_price_tiers
  FOR DELETE USING (auth.role() = 'authenticated');

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_person_price_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour appeler la fonction ci-dessus
DROP TRIGGER IF EXISTS update_person_price_tiers_updated_at_trigger ON person_price_tiers;
CREATE TRIGGER update_person_price_tiers_updated_at_trigger
  BEFORE UPDATE ON person_price_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_person_price_tiers_updated_at();

COMMENT ON TABLE person_price_tiers IS 'Table pour gérer les tarifs dégressifs par nombre de personnes';
COMMENT ON COLUMN person_price_tiers.product_id IS 'Référence au produit';
COMMENT ON COLUMN person_price_tiers.min_persons IS 'Nombre minimum de personnes pour ce palier';
COMMENT ON COLUMN person_price_tiers.max_persons IS 'Nombre maximum de personnes (NULL = illimité)';
COMMENT ON COLUMN person_price_tiers.price_per_person IS 'Prix par personne pour ce palier (utilisé si discount_type = fixed)';
COMMENT ON COLUMN person_price_tiers.tier_order IS 'Ordre d affichage des paliers';
COMMENT ON COLUMN person_price_tiers.discount_type IS 'Type de tarification: fixed (prix fixe) ou percentage (réduction en %)';
COMMENT ON COLUMN person_price_tiers.discount_percentage IS 'Pourcentage de réduction appliqué au prix de base (utilisé si discount_type = percentage)';
