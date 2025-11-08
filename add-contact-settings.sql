-- Ajouter les paramètres de contact à la table site_settings

DO $$
BEGIN
  -- Vérifier si l'adresse existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'contact_address_1'
  ) THEN
    -- Insérer l'adresse par défaut
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'contact_address_1',
      '1 rue du Nil, 44800 Saint-Herblain',
      'text',
      'Adresse de contact 1'
    );
  END IF;

  -- Vérifier si le numéro de téléphone existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'contact_phone_1'
  ) THEN
    -- Insérer le numéro de téléphone par défaut
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'contact_phone_1',
      '+33 6 15 32 99 72',
      'text',
      'Numéro de téléphone 1'
    );
  END IF;
END $$;

-- Afficher les paramètres de contact
SELECT * FROM site_settings WHERE setting_key LIKE 'contact_%';
