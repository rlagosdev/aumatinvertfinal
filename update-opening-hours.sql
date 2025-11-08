-- Mise à jour des horaires d'ouverture pour Au Matin Vert
-- Horaires réels: Lundi: Fermé • Mar-Ven: 8h-12h45 / 15h30-19h • Sam: 8h-13h / 15h30-19h • Dimanche: Fermé

-- Supprimer les anciens horaires s'ils existent
DELETE FROM site_settings WHERE setting_key LIKE 'opening_hours_%';

-- Lundi : Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_monday', '{"day":"Lundi","isOpen":false,"morning":null,"afternoon":null}', 'json', 'Horaires d''ouverture du lundi');

-- Mardi : 8h-12h45 / 15h30-19h
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_tuesday', '{"day":"Mardi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du mardi');

-- Mercredi : 8h-12h45 / 15h30-19h
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_wednesday', '{"day":"Mercredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du mercredi');

-- Jeudi : 8h-12h45 / 15h30-19h
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_thursday', '{"day":"Jeudi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du jeudi');

-- Vendredi : 8h-12h45 / 15h30-19h
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_friday', '{"day":"Vendredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du vendredi');

-- Samedi : 8h-13h / 15h30-19h
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_saturday', '{"day":"Samedi","isOpen":true,"morning":{"open":"08:00","close":"13:00"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du samedi');

-- Dimanche : Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_sunday', '{"day":"Dimanche","isOpen":false,"morning":null,"afternoon":null}', 'json', 'Horaires d''ouverture du dimanche');