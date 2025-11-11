-- Création de la table pour les paliers de prix par personne
-- Cette table permet de définir des tarifs dégressifs selon le nombre de personnes
-- Exemple: 5€/pers pour 1-10 personnes, 4€/pers pour 11-20 personnes, etc.

CREATE TABLE IF NOT EXISTS person_price_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  min_persons INTEGER NOT NULL CHECK (min_persons > 0),
  max_persons INTEGER CHECK (max_persons IS NULL OR max_persons >= min_persons),
  price_per_person DECIMAL(10, 2) NOT NULL CHECK (price_per_person > 0),
  tier_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_person_price_tiers_product ON person_price_tiers(product_id);
CREATE INDEX IF NOT EXISTS idx_person_price_tiers_order ON person_price_tiers(product_id, tier_order);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_person_price_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_person_price_tiers_updated_at
  BEFORE UPDATE ON person_price_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_person_price_tiers_updated_at();

-- Commentaires pour la documentation
COMMENT ON TABLE person_price_tiers IS 'Paliers de tarifs dégressifs pour la tarification par personne';
COMMENT ON COLUMN person_price_tiers.product_id IS 'Référence au produit';
COMMENT ON COLUMN person_price_tiers.min_persons IS 'Nombre minimum de personnes pour ce palier';
COMMENT ON COLUMN person_price_tiers.max_persons IS 'Nombre maximum de personnes (NULL = illimité)';
COMMENT ON COLUMN person_price_tiers.price_per_person IS 'Prix par personne pour ce palier';
COMMENT ON COLUMN person_price_tiers.tier_order IS 'Ordre d affichage des paliers';

-- Activer Row Level Security
ALTER TABLE person_price_tiers ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique
CREATE POLICY "Allow public read access to person_price_tiers"
  ON person_price_tiers
  FOR SELECT
  USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de tout faire
CREATE POLICY "Allow authenticated users full access to person_price_tiers"
  ON person_price_tiers
  FOR ALL
  USING (true)
  WITH CHECK (true);
