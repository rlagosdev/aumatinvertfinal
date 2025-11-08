-- Corriger la valeur du délai minimum pour les plateaux événementiels

-- Mettre à jour la valeur pour inclure "jours"
UPDATE site_settings
SET setting_value = '4 jours'
WHERE setting_key = 'min_delai_plateau';

-- Si le paramètre n'existe pas, l'insérer
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
SELECT 'min_delai_plateau', '4 jours', 'text', 'Délai minimum de préparation pour les plateaux événementiels'
WHERE NOT EXISTS (
  SELECT 1 FROM site_settings WHERE setting_key = 'min_delai_plateau'
);

-- Vérifier le résultat
SELECT setting_key, setting_value, description
FROM site_settings
WHERE setting_key = 'min_delai_plateau';
