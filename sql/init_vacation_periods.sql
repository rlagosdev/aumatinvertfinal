-- Script d'initialisation des périodes de vacances
-- À exécuter dans votre base de données Supabase

-- Supprimer les anciennes périodes de vacances s'elles existent
DELETE FROM site_settings WHERE setting_key LIKE 'vacation_period_%';

-- Exemple de période de vacances (à adapter selon vos besoins)
-- Décommentez et modifiez les dates selon vos périodes de vacances

-- Vacances d'été exemple
-- INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
-- ('vacation_period_summer_2024', 
--  '{"id":"vacation_summer_2024","startDate":"2024-08-01","endDate":"2024-08-15","description":"Vacances d''été 2024","isActive":true}', 
--  'json', 
--  'Période de vacances: Vacances d''été 2024');

-- Vacances de Noël exemple  
-- INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
-- ('vacation_period_christmas_2024', 
--  '{"id":"vacation_christmas_2024","startDate":"2024-12-23","endDate":"2025-01-02","description":"Vacances de Noël 2024","isActive":true}', 
--  'json', 
--  'Période de vacances: Vacances de Noël 2024');

-- Note: Les périodes de vacances peuvent être gérées directement depuis l'interface d'administration
-- Allez dans Admin Dashboard > Personnalisation > Section "Périodes de vacances"