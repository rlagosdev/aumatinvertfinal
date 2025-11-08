-- Supprimer les deux versions de la fonction pour éviter les conflits
DROP FUNCTION IF EXISTS validate_promo_code(character varying, uuid, character varying, uuid);
DROP FUNCTION IF EXISTS validate_promo_code(text, uuid, text, uuid);

-- Recréer UNE SEULE version avec les bons types
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_product_id UUID,
  p_pricing_type TEXT,
  p_pricing_item_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_result JSON;
BEGIN
  -- Récupérer le code promo
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE code = UPPER(p_code)
    AND product_id = p_product_id
    AND actif = true;

  -- Si le code n'existe pas
  IF NOT FOUND THEN
    RETURN json_build_object(
      'isValid', false,
      'message', 'Code promo invalide ou inexistant'
    );
  END IF;

  -- Vérifier le type de tarification
  IF v_promo.pricing_type != p_pricing_type THEN
    RETURN json_build_object(
      'isValid', false,
      'message', 'Ce code promo ne s''applique pas à ce type de tarification'
    );
  END IF;

  -- Vérifier l'item ID si nécessaire (pour tier, section, range, weight)
  IF p_pricing_type IN ('tier', 'section', 'range', 'weight') THEN
    IF v_promo.pricing_item_id IS NULL OR v_promo.pricing_item_id != p_pricing_item_id THEN
      RETURN json_build_object(
        'isValid', false,
        'message', 'Ce code promo ne s''applique pas à cet item spécifique'
      );
    END IF;
  END IF;

  -- Vérifier la date de validité
  IF v_promo.valid_from IS NOT NULL AND CURRENT_DATE < v_promo.valid_from THEN
    RETURN json_build_object(
      'isValid', false,
      'message', 'Ce code promo n''est pas encore valide'
    );
  END IF;

  IF v_promo.valid_until IS NOT NULL AND CURRENT_DATE > v_promo.valid_until THEN
    RETURN json_build_object(
      'isValid', false,
      'message', 'Ce code promo a expiré'
    );
  END IF;

  -- Vérifier la limite d'utilisation
  IF v_promo.usage_limit IS NOT NULL AND v_promo.usage_count >= v_promo.usage_limit THEN
    RETURN json_build_object(
      'isValid', false,
      'message', 'Ce code promo a atteint sa limite d''utilisation'
    );
  END IF;

  -- Le code est valide
  RETURN json_build_object(
    'isValid', true,
    'discountPercentage', v_promo.discount_percentage,
    'promoId', v_promo.id,
    'message', 'Code promo valide'
  );
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, UUID, TEXT, UUID) TO anon, authenticated;
