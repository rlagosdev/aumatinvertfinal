-- Ajouter des promotions sur les paliers de prix individuels

-- 1. Ajouter les champs de promotion à la table product_price_tiers
DO $$
BEGIN
  -- Prix promotionnel
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_price_tiers' AND column_name = 'promotion_price'
  ) THEN
    ALTER TABLE product_price_tiers ADD COLUMN promotion_price DECIMAL(10, 2) NULL;
  END IF;

  -- Promotion active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_price_tiers' AND column_name = 'promotion_active'
  ) THEN
    ALTER TABLE product_price_tiers ADD COLUMN promotion_active BOOLEAN DEFAULT false;
  END IF;

  -- Date de début de promotion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_price_tiers' AND column_name = 'promotion_start_date'
  ) THEN
    ALTER TABLE product_price_tiers ADD COLUMN promotion_start_date TIMESTAMP WITH TIME ZONE NULL;
  END IF;

  -- Date de fin de promotion
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_price_tiers' AND column_name = 'promotion_end_date'
  ) THEN
    ALTER TABLE product_price_tiers ADD COLUMN promotion_end_date TIMESTAMP WITH TIME ZONE NULL;
  END IF;
END $$;

-- 2. Ajouter des commentaires
COMMENT ON COLUMN product_price_tiers.promotion_price IS 'Prix promotionnel pour ce palier (si différent du prix normal)';
COMMENT ON COLUMN product_price_tiers.promotion_active IS 'Si true, la promotion est active pour ce palier';
COMMENT ON COLUMN product_price_tiers.promotion_start_date IS 'Date de début de la promotion';
COMMENT ON COLUMN product_price_tiers.promotion_end_date IS 'Date de fin de la promotion';

-- 3. Créer un index pour les recherches de promotions actives
CREATE INDEX IF NOT EXISTS idx_product_price_tiers_promotion
ON product_price_tiers(product_id, promotion_active)
WHERE promotion_active = true;

-- 4. Fonction pour vérifier si une promotion est valide
CREATE OR REPLACE FUNCTION is_tier_promotion_valid(
  tier_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  tier_record RECORD;
  current_time TIMESTAMPTZ := NOW();
BEGIN
  SELECT
    promotion_active,
    promotion_start_date,
    promotion_end_date,
    promotion_price
  INTO tier_record
  FROM product_price_tiers
  WHERE id = tier_id;

  -- Vérifier si la promotion est active
  IF NOT tier_record.promotion_active THEN
    RETURN false;
  END IF;

  -- Vérifier si le prix promotionnel existe
  IF tier_record.promotion_price IS NULL THEN
    RETURN false;
  END IF;

  -- Vérifier les dates
  IF tier_record.promotion_start_date IS NOT NULL AND current_time < tier_record.promotion_start_date THEN
    RETURN false;
  END IF;

  IF tier_record.promotion_end_date IS NOT NULL AND current_time > tier_record.promotion_end_date THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- 5. Vue pour afficher les paliers avec leurs promotions actives
CREATE OR REPLACE VIEW product_price_tiers_with_promotions AS
SELECT
  pt.*,
  p.nom as product_name,
  CASE
    WHEN is_tier_promotion_valid(pt.id) THEN pt.promotion_price
    ELSE pt.price
  END as effective_price,
  is_tier_promotion_valid(pt.id) as has_active_promotion,
  CASE
    WHEN is_tier_promotion_valid(pt.id) AND pt.promotion_price IS NOT NULL THEN
      ROUND(((pt.price - pt.promotion_price) / pt.price * 100)::numeric, 0)
    ELSE 0
  END as discount_percentage
FROM product_price_tiers pt
JOIN products p ON pt.product_id = p.id
ORDER BY pt.product_id, pt.tier_order;

-- 6. Exemple de données pour tester
-- Activer une promotion sur un palier spécifique
-- UPDATE product_price_tiers
-- SET
--   promotion_price = 39.99,
--   promotion_active = true,
--   promotion_start_date = NOW(),
--   promotion_end_date = NOW() + INTERVAL '7 days'
-- WHERE product_id = 'PRODUCT_ID' AND quantity = 6;

-- Vérifier les paliers avec promotions actives
SELECT * FROM product_price_tiers_with_promotions
WHERE has_active_promotion = true;
