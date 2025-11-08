-- Script pour ajouter les images des services spécialisés
-- À exécuter dans Supabase SQL Editor

-- Ajouter l'image du Service Seniors
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES (
  'service_seniors_image',
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'image_url',
  'Image du Service Seniors (livraison aux personnes âgées)'
)
ON CONFLICT (setting_key)
DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  setting_type = EXCLUDED.setting_type,
  description = EXCLUDED.description;

-- Ajouter l'image du Service Entreprises
INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
VALUES (
  'service_business_image',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  'image_url',
  'Image du Service Entreprises (livraison professionnelle)'
)
ON CONFLICT (setting_key)
DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  setting_type = EXCLUDED.setting_type,
  description = EXCLUDED.description;

-- Vérifier que les entrées ont été créées
SELECT setting_key, setting_value, setting_type, description
FROM site_settings
WHERE setting_key IN ('service_seniors_image', 'service_business_image');
