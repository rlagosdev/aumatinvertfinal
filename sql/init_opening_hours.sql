-- Script d'initialisation des horaires d'ouverture
-- À exécuter dans votre base de données Supabase

-- Supprimer les anciens horaires s'ils existent
DELETE FROM site_settings WHERE setting_key LIKE 'opening_hours_%';

-- Lundi - Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_monday', '{"day":"Lundi","isOpen":false}', 'json', 'Horaires d''ouverture pour Lundi');

-- Mardi - Ouvert
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_tuesday', '{"day":"Mardi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture pour Mardi');

-- Mercredi - Ouvert
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_wednesday', '{"day":"Mercredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture pour Mercredi');

-- Jeudi - Ouvert
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_thursday', '{"day":"Jeudi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture pour Jeudi');

-- Vendredi - Ouvert
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_friday', '{"day":"Vendredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture pour Vendredi');

-- Samedi - Ouvert
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_saturday', '{"day":"Samedi","isOpen":true,"morning":{"open":"08:00","close":"13:00"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture pour Samedi');

-- Dimanche - Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_sunday', '{"day":"Dimanche","isOpen":false}', 'json', 'Horaires d''ouverture pour Dimanche');