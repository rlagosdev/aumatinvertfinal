-- Ajouter les paramètres des produits phares dans la table site_settings

-- Paramètre d'activation/désactivation des produits phares
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('featured_products_enabled', 'true', 'boolean', 'Affichage de la section produits phares sur la page d''accueil')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = EXCLUDED.description;

-- IDs des produits phares sélectionnés (par défaut, les 4 produits d'exemple)
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('featured_products_ids', '["default-1","default-2","default-3","default-4"]', 'json', 'IDs des produits phares sélectionnés pour l''affichage')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = EXCLUDED.description;

-- Vérifier que les paramètres ont été ajoutés
SELECT setting_key, setting_value, setting_type, description 
FROM site_settings 
WHERE setting_key LIKE 'featured_products_%' 
ORDER BY setting_key;