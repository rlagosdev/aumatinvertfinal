-- Fonction améliorée pour valider un code promo
-- Cette version gère mieux les codes "ALL_PRODUCTS" et les différents types de pricing
DROP FUNCTION IF EXISTS validate_promo_code(TEXT, UUID, TEXT, UUID);

CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_product_id TEXT, -- Changé de UUID à TEXT pour supporter 'ALL_PRODUCTS'
  p_pricing_type TEXT,
  p_pricing_item_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_promo promo_codes;
  v_product_uuid UUID;
BEGIN
  -- Convertir p_product_id en UUID si ce n'est pas 'ALL_PRODUCTS'
  IF p_product_id = 'ALL_PRODUCTS' THEN
    v_product_uuid := NULL;
  ELSE
    BEGIN
      v_product_uuid := p_product_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      RETURN json_build_object(
        'isValid', false,
        'discountPercentage', 0,
        'message', 'ID de produit invalide'
      );
    END;
  END IF;

  -- Rechercher le code promo
  -- Priorité 1: Code pour ce produit spécifique ET ce type de pricing
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND product_id = v_product_uuid
    AND pricing_type = p_pricing_type
    AND actif = true
  LIMIT 1;

  -- Si pas trouvé et qu'on cherche avec un pricing_item_id spécifique
  -- Priorité 2: Code pour ce produit avec l'item de pricing spécifique
  IF v_promo.id IS NULL AND p_pricing_item_id IS NOT NULL THEN
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
      AND product_id = v_product_uuid
      AND pricing_type = p_pricing_type
      AND pricing_item_id = p_pricing_item_id
      AND actif = true
    LIMIT 1;
  END IF;

  -- Si toujours pas trouvé
  -- Priorité 3: Chercher un code ALL_PRODUCTS avec le même pricing_type
  IF v_promo.id IS NULL THEN
    SELECT * INTO v_promo
    FROM promo_codes pc
    LEFT JOIN products p ON pc.product_id = p.id
    WHERE UPPER(pc.code) = UPPER(p_code)
      AND (p.nom = 'ALL_PRODUCTS' OR pc.product_id IS NULL)
      AND pc.pricing_type = p_pricing_type
      AND pc.actif = true
    LIMIT 1;
  END IF;

  -- Si toujours rien
  -- Priorité 4: Chercher un code pour ce produit avec pricing_type 'normal'
  IF v_promo.id IS NULL THEN
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
      AND product_id = v_product_uuid
      AND pricing_type = 'normal'
      AND actif = true
    LIMIT 1;
  END IF;

  -- Si le code n'existe pas du tout
  IF v_promo.id IS NULL THEN
    RETURN json_build_object(
      'isValid', false,
      'discountPercentage', 0,
      'message', 'Code promo invalide ou inexistant'
    );
  END IF;

  -- Vérifier les dates de validité
  IF v_promo.valid_from IS NOT NULL AND NOW() < v_promo.valid_from THEN
    RETURN json_build_object(
      'isValid', false,
      'discountPercentage', 0,
      'message', 'Ce code promo n''est pas encore valide'
    );
  END IF;

  IF v_promo.valid_until IS NOT NULL AND NOW() > v_promo.valid_until THEN
    RETURN json_build_object(
      'isValid', false,
      'discountPercentage', 0,
      'message', 'Ce code promo a expiré'
    );
  END IF;

  -- Vérifier la limite d'utilisation
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN json_build_object(
      'isValid', false,
      'discountPercentage', 0,
      'message', 'Ce code promo a atteint sa limite d''utilisation'
    );
  END IF;

  -- Code valide !
  RETURN json_build_object(
    'isValid', true,
    'discountPercentage', v_promo.discount_percentage,
    'message', 'Code promo valide'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, TEXT, TEXT, UUID) TO anon, authenticated;
