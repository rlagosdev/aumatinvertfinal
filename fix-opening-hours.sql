-- Fix des horaires d'ouverture avec JSON valide
-- Supprimer les horaires corrompus
DELETE FROM site_settings WHERE setting_key LIKE 'opening_hours_%';

-- Insérer les horaires avec JSON valide (sans guillemets échappés problématiques)

-- Lundi : Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_monday', '{"day":"Lundi","isOpen":false,"morning":null,"afternoon":null}', 'json', 'Horaires ouverture du lundi');

-- Mardi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_tuesday', '{"day":"Mardi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires ouverture du mardi');

-- Mercredi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_wednesday', '{"day":"Mercredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires ouverture du mercredi');

-- Jeudi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_thursday', '{"day":"Jeudi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires ouverture du jeudi');

-- Vendredi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_friday', '{"day":"Vendredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires ouverture du vendredi');

-- Samedi : 08h00-13h00 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_saturday', '{"day":"Samedi","isOpen":true,"morning":{"open":"08:00","close":"13:00"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires ouverture du samedi');

-- Dimanche : Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_sunday', '{"day":"Dimanche","isOpen":false,"morning":null,"afternoon":null}', 'json', 'Horaires ouverture du dimanche');

-- Vérifier le résultat
SELECT setting_key, setting_value FROM site_settings WHERE setting_key LIKE 'opening_hours_%' ORDER BY setting_key;