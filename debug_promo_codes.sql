-- Script pour déboguer les codes promo du produit "Cornets de fromages"

-- 1. Trouver le produit
SELECT id, nom, use_price_tiers
FROM products
WHERE nom ILIKE '%Cornets de fromages%';

-- 2. Récupérer tous les codes promo pour ce produit
-- Remplacez 'PRODUCT_ID_ICI' par l'ID obtenu à l'étape 1
SELECT
  code,
  pricing_type,
  pricing_item_id,
  discount_percentage,
  actif,
  valid_from,
  valid_until,
  usage_count,
  usage_limit
FROM promo_codes
WHERE product_id = (SELECT id FROM products WHERE nom ILIKE '%Cornets de fromages%' LIMIT 1);

-- 3. Récupérer tous les paliers de prix pour ce produit
SELECT
  id,
  quantity,
  price,
  tier_order,
  promotion_active,
  promotion_type,
  promotion_price,
  promotion_discount_percent
FROM product_price_tiers
WHERE product_id = (SELECT id FROM products WHERE nom ILIKE '%Cornets de fromages%' LIMIT 1)
ORDER BY tier_order;

-- 4. Vérifier si les codes promo correspondent aux paliers
SELECT
  pc.code,
  pc.pricing_type,
  pc.pricing_item_id,
  pc.discount_percentage,
  ppt.quantity as tier_quantity,
  ppt.price as tier_price
FROM promo_codes pc
LEFT JOIN product_price_tiers ppt ON pc.pricing_item_id = ppt.id
WHERE pc.product_id = (SELECT id FROM products WHERE nom ILIKE '%Cornets de fromages%' LIMIT 1);
