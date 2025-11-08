-- Ajouter l'email de contact à la table site_settings

DO $$
BEGIN
  -- Vérifier si l'email existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'contact_email_1'
  ) THEN
    -- Insérer l'email par défaut
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'contact_email_1',
      'contact@aumatinvert.fr',
      'text',
      'Email de contact 1'
    );
  END IF;
END $$;

-- Afficher tous les paramètres de contact
SELECT * FROM site_settings WHERE setting_key LIKE 'contact_%' ORDER BY setting_key;
