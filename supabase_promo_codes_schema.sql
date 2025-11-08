-- Table pour les codes promo
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  pricing_type TEXT NOT NULL DEFAULT 'normal', -- 'normal', 'section', 'range', 'weight', 'tier', 'person'
  pricing_item_id UUID, -- ID de la section, gamme, tier, etc. (NULL pour 'normal' et 'person')
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  description TEXT,
  usage_limit INTEGER, -- NULL = illimité
  usage_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_codes_product_id ON promo_codes(product_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_actif ON promo_codes(actif);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_promo_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_promo_codes_updated_at();

-- Fonction pour valider un code promo
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_product_id UUID,
  p_pricing_type TEXT,
  p_pricing_item_id UUID DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  discount_percentage INTEGER,
  message TEXT
) AS $$
DECLARE
  v_promo promo_codes;
BEGIN
  -- Rechercher le code promo
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND product_id = p_product_id
    AND actif = true
  LIMIT 1;

  -- Si le code n'existe pas
  IF v_promo.id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'Code promo invalide ou inexistant'::TEXT;
    RETURN;
  END IF;

  -- Vérifier les dates de validité
  IF v_promo.valid_from IS NOT NULL AND NOW() < v_promo.valid_from THEN
    RETURN QUERY SELECT false, 0, 'Ce code promo n''est pas encore valide'::TEXT;
    RETURN;
  END IF;

  IF v_promo.valid_until IS NOT NULL AND NOW() > v_promo.valid_until THEN
    RETURN QUERY SELECT false, 0, 'Ce code promo a expiré'::TEXT;
    RETURN;
  END IF;

  -- Vérifier la limite d'utilisation
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN QUERY SELECT false, 0, 'Ce code promo a atteint sa limite d''utilisation'::TEXT;
    RETURN;
  END IF;

  -- Vérifier le type de tarification
  IF v_promo.pricing_type != p_pricing_type THEN
    RETURN QUERY SELECT false, 0, 'Ce code promo ne s''applique pas à ce type de tarification'::TEXT;
    RETURN;
  END IF;

  -- Vérifier l'ID de l'élément de tarification (section, gamme, tier, etc.)
  IF v_promo.pricing_type IN ('section', 'range', 'weight', 'tier') THEN
    IF p_pricing_item_id IS NULL OR v_promo.pricing_item_id != p_pricing_item_id THEN
      RETURN QUERY SELECT false, 0, 'Ce code promo ne s''applique pas à cette option'::TEXT;
      RETURN;
    END IF;
  END IF;

  -- Code valide !
  RETURN QUERY SELECT true, v_promo.discount_percentage, 'Code promo valide'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur d'utilisation
CREATE OR REPLACE FUNCTION increment_promo_code_usage(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE promo_codes
  SET usage_count = usage_count + 1
  WHERE UPPER(code) = UPPER(p_code);
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Politique pour la lecture (tout le monde peut lire les codes actifs)
CREATE POLICY "Promo codes are viewable by everyone"
  ON promo_codes FOR SELECT
  USING (actif = true);

-- Politique pour l'insertion (seulement les admins authentifiés)
CREATE POLICY "Promo codes are insertable by authenticated users"
  ON promo_codes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Politique pour la mise à jour (seulement les admins authentifiés)
CREATE POLICY "Promo codes are updatable by authenticated users"
  ON promo_codes FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Politique pour la suppression (seulement les admins authentifiés)
CREATE POLICY "Promo codes are deletable by authenticated users"
  ON promo_codes FOR DELETE
  USING (auth.role() = 'authenticated');

-- Quelques exemples de codes promo pour tester
-- IMPORTANT: Remplacez les UUID par des IDs de produits réels de votre base de données
--
-- Exemple 1: Code promo général pour un produit (10% de réduction)
-- INSERT INTO promo_codes (code, product_id, pricing_type, discount_percentage, description)
-- VALUES ('BIENVENUE10', 'votre-product-id-ici', 'normal', 10, 'Code de bienvenue - 10% de réduction');
--
-- Exemple 2: Code promo pour une gamme spécifique (15% de réduction)
-- INSERT INTO promo_codes (code, product_id, pricing_type, pricing_item_id, discount_percentage, description)
-- VALUES ('GAMME15', 'votre-product-id-ici', 'range', 'votre-range-id-ici', 15, '15% sur la gamme spécifique');
