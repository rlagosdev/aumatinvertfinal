-- Ajouter les informations de l'entreprise à la table site_settings

DO $$
BEGIN
  -- Vérifier si le nom de l'entreprise existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'company_name'
  ) THEN
    -- Insérer le nom par défaut
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'company_name',
      'Au Matin Vert',
      'text',
      'Nom de l''entreprise'
    );
  END IF;

  -- Vérifier si la description existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'company_description'
  ) THEN
    -- Insérer la description par défaut
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'company_description',
      'Épicerie du centre commercial des Thébaudières',
      'text',
      'Description de l''entreprise'
    );
  END IF;
END $$;

-- Afficher les informations de l'entreprise
SELECT * FROM site_settings WHERE setting_key IN ('company_name', 'company_description');
