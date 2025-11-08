-- Supprimer l'ancienne fonction (toutes les variantes possibles)
DROP FUNCTION IF EXISTS validate_promo_code(TEXT, UUID, TEXT, UUID);
DROP FUNCTION IF EXISTS validate_promo_code(TEXT, TEXT, TEXT, UUID);

-- Nouvelle fonction améliorée pour valider un code promo
-- Compatible avec les appels existants en acceptant TEXT ou UUID pour p_product_id
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_product_id TEXT, -- Accepte TEXT pour supporter 'ALL_PRODUCTS' et les UUID en string
  p_pricing_type TEXT,
  p_pricing_item_id TEXT DEFAULT NULL -- Changé en TEXT pour plus de flexibilité
)
RETURNS JSON AS $$
DECLARE
  v_promo promo_codes;
  v_product_uuid UUID;
  v_item_uuid UUID;
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

  -- Convertir p_pricing_item_id en UUID si fourni
  IF p_pricing_item_id IS NOT NULL AND p_pricing_item_id != '' THEN
    BEGIN
      v_item_uuid := p_pricing_item_id::UUID;
    EXCEPTION WHEN OTHERS THEN
      v_item_uuid := NULL;
    END;
  ELSE
    v_item_uuid := NULL;
  END IF;

  RAISE NOTICE 'Recherche code: %, produit: %, type: %, item: %', p_code, v_product_uuid, p_pricing_type, v_item_uuid;

  -- Priorité 1: Code pour ce produit spécifique ET ce type de pricing (sans restriction sur l'item)
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND product_id = v_product_uuid
    AND pricing_type = p_pricing_type
    AND actif = true
  LIMIT 1;

  RAISE NOTICE 'Priorité 1 résultat: %', v_promo.id;

  -- Priorité 2: Si un item spécifique est demandé et qu'on n'a pas trouvé, chercher avec l'item
  IF v_promo.id IS NULL AND v_item_uuid IS NOT NULL THEN
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
      AND product_id = v_product_uuid
      AND pricing_type = p_pricing_type
      AND pricing_item_id = v_item_uuid
      AND actif = true
    LIMIT 1;

    RAISE NOTICE 'Priorité 2 résultat: %', v_promo.id;
  END IF;

  -- Priorité 3: Chercher un code pour ce produit avec pricing_type 'normal' (fallback)
  IF v_promo.id IS NULL AND v_product_uuid IS NOT NULL THEN
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
      AND product_id = v_product_uuid
      AND pricing_type = 'normal'
      AND actif = true
    LIMIT 1;

    RAISE NOTICE 'Priorité 3 résultat: %', v_promo.id;
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
  RAISE NOTICE 'Code valide! Réduction: %', v_promo.discount_percentage;

  RETURN json_build_object(
    'isValid', true,
    'discountPercentage', v_promo.discount_percentage,
    'message', 'Code promo valide'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Créer une surcharge pour accepter NULL comme dernier paramètre plus facilement
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_product_id TEXT,
  p_pricing_type TEXT
)
RETURNS JSON AS $$
BEGIN
  RETURN validate_promo_code(p_code, p_product_id, p_pricing_type, NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, TEXT, TEXT) TO anon, authenticated;
