-- Ajouter les colonnes pour supporter les remises en pourcentage

ALTER TABLE person_price_tiers
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(10) DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2);

-- Mettre à jour les enregistrements existants pour marquer qu'ils utilisent un prix fixe
UPDATE person_price_tiers
SET discount_type = 'fixed'
WHERE discount_type IS NULL;

-- Commentaires pour documentation
COMMENT ON COLUMN person_price_tiers.discount_type IS 'Type de remise: fixed (prix fixe) ou percentage (pourcentage de réduction)';
COMMENT ON COLUMN person_price_tiers.discount_percentage IS 'Pourcentage de réduction à appliquer sur le prix de base (utilisé si discount_type = percentage)';
