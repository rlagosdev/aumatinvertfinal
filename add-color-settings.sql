-- Script pour initialiser ou mettre à jour les paramètres de couleur dans la base de données

DO $$
BEGIN
  -- Couleur primaire
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_primary') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_primary', '#9333ea', 'color', 'Couleur principale du site');
  END IF;

  -- Couleur de fond
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_background') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_background', '#ffffff', 'color', 'Couleur d''arrière-plan');
  END IF;

  -- Couleur texte foncé
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_text_dark') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_text_dark', '#374151', 'color', 'Couleur de texte foncé');
  END IF;

  -- Couleur texte clair
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_text_light') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_text_light', '#ffffff', 'color', 'Couleur de texte clair');
  END IF;

  -- Couleur boutons
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_buttons') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_buttons', '#a855f7', 'color', 'Couleur des boutons');
  END IF;

  -- Couleur titre entreprise
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_company_title') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_company_title', '#1f2937', 'color', 'Couleur du titre de l''entreprise');
  END IF;

  -- Couleur créneau occupé
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_slot_occupied') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_slot_occupied', '#fca5a5', 'color', 'Couleur des créneaux occupés');
  END IF;

  -- Couleur créneau disponible
  IF NOT EXISTS (SELECT 1 FROM site_settings WHERE setting_key = 'color_slot_available') THEN
    INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
    VALUES ('color_slot_available', '#93c5fd', 'color', 'Couleur des créneaux disponibles');
  END IF;
END $$;

-- Vérifier les couleurs enregistrées
SELECT setting_key, setting_value, setting_type, description
FROM site_settings
WHERE setting_type = 'color'
ORDER BY setting_key;
