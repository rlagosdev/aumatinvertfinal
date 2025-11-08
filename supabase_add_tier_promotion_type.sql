-- Ajout des colonnes pour gérer les promotions par prix fixe ou pourcentage
-- sur les paliers de prix (product_price_tiers)

ALTER TABLE product_price_tiers
ADD COLUMN IF NOT EXISTS promotion_discount_percent NUMERIC(5, 2),
ADD COLUMN IF NOT EXISTS promotion_type TEXT CHECK (promotion_type IN ('fixed', 'percent'));

-- Commentaires pour documentation
COMMENT ON COLUMN product_price_tiers.promotion_discount_percent IS 'Pourcentage de réduction (0-100) si promotion_type = percent';
COMMENT ON COLUMN product_price_tiers.promotion_type IS 'Type de promotion: fixed (prix fixe) ou percent (pourcentage)';

-- Mise à jour des données existantes pour définir le type par défaut
UPDATE product_price_tiers
SET promotion_type = 'fixed'
WHERE promotion_price IS NOT NULL AND promotion_type IS NULL;
