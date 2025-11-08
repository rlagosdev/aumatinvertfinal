-- Script pour corriger les données JSON corrompues des horaires d'ouverture
-- À exécuter dans l'éditeur SQL de Supabase

-- Nettoyer et corriger les données JSON des horaires d'ouverture
UPDATE site_settings 
SET setting_value = '{"monday": {"isOpen": true, "openTime": "08:30", "closeTime": "19:30"}, "tuesday": {"isOpen": true, "openTime": "08:30", "closeTime": "19:30"}, "wednesday": {"isOpen": true, "openTime": "08:30", "closeTime": "19:30"}, "thursday": {"isOpen": true, "openTime": "08:30", "closeTime": "19:30"}, "friday": {"isOpen": true, "openTime": "08:30", "closeTime": "19:30"}, "saturday": {"isOpen": true, "openTime": "08:30", "closeTime": "19:30"}, "sunday": {"isOpen": false, "openTime": "", "closeTime": ""}}'
WHERE setting_key = 'opening_hours';

-- Vérifier que les données ont été corrigées
SELECT setting_key, setting_value, setting_type 
FROM site_settings 
WHERE setting_key = 'opening_hours';