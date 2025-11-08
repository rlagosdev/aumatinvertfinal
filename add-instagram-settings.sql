-- Ajouter les paramètres Instagram dans la table site_settings

-- Paramètre d'activation/désactivation de l'affichage Instagram
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('instagram_enabled', 'false', 'boolean', 'Affichage de la publication Instagram sur la page d''accueil')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = EXCLUDED.description;

-- URL de la publication Instagram
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('instagram_post_url', '', 'string', 'URL de la publication Instagram à afficher')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = EXCLUDED.description;

-- Code d'intégration généré automatiquement
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('instagram_embed_code', '', 'string', 'Code d''intégration généré pour la publication Instagram')
ON CONFLICT (setting_key) DO UPDATE SET 
    setting_value = EXCLUDED.setting_value,
    setting_type = EXCLUDED.setting_type,
    description = EXCLUDED.description;

-- Vérifier que les paramètres ont été ajoutés
SELECT setting_key, setting_value, setting_type, description 
FROM site_settings 
WHERE setting_key LIKE 'instagram_%' 
ORDER BY setting_key;