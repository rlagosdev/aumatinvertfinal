-- Ajouter le paramètre logo_image à la table site_settings

-- Vérifier si la table site_settings existe et ajouter le paramètre si nécessaire
DO $$
BEGIN
  -- Vérifier si le paramètre logo_image existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'logo_image'
  ) THEN
    -- Insérer le paramètre logo_image
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'logo_image',
      'https://images.unsplash.com/photo-1518636744428-8e98b26e57d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'image_url',
      'URL de l''image du logo de l''entreprise'
    );
  END IF;

  -- Vérifier si le paramètre logo_shape existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM site_settings WHERE setting_key = 'logo_shape'
  ) THEN
    -- Insérer le paramètre logo_shape
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES (
      'logo_shape',
      'circle',
      'text',
      'Forme du logo (circle ou square)'
    );
  END IF;
END $$;

-- Afficher les paramètres du logo
SELECT * FROM site_settings WHERE setting_key IN ('logo_image', 'logo_shape');
