-- Vérifier les couleurs actuellement dans la base de données
SELECT setting_key, setting_value, setting_type
FROM site_settings
WHERE setting_type = 'color'
ORDER BY setting_key;
