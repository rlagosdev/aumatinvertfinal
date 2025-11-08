-- Script d'initialisation de la table site_settings pour Au Matin Vert
-- À exécuter dans Supabase SQL Editor

-- Créer la table site_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer une fonction pour automatiquement mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Désactiver RLS pour permettre l'accès public aux paramètres du site
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;

-- Supprimer tous les anciens paramètres
DELETE FROM site_settings;

-- === PARAMÈTRES GÉNÉRAUX ===

-- Délai minimum pour les plateaux (en jours)
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('min_delai_plateau', '4', 'number', 'Délai minimum en jours pour commander un plateau');

-- === HORAIRES D'OUVERTURE ===

-- Lundi : Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_monday', '{"day":"Lundi","isOpen":false,"morning":null,"afternoon":null}', 'json', 'Horaires d''ouverture du lundi');

-- Mardi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_tuesday', '{"day":"Mardi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du mardi');

-- Mercredi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_wednesday', '{"day":"Mercredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du mercredi');

-- Jeudi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_thursday', '{"day":"Jeudi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du jeudi');

-- Vendredi : 08h00-12h45 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_friday', '{"day":"Vendredi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du vendredi');

-- Samedi : 08h00-13h00 / 15h30-19h00
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_saturday', '{"day":"Samedi","isOpen":true,"morning":{"open":"08:00","close":"13:00"},"afternoon":{"open":"15:30","close":"19:00"}}', 'json', 'Horaires d''ouverture du samedi');

-- Dimanche : Fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('opening_hours_sunday', '{"day":"Dimanche","isOpen":false,"morning":null,"afternoon":null}', 'json', 'Horaires d''ouverture du dimanche');

-- === TARIFS DE LIVRAISON ===

-- Tarif de livraison 1 : Gratuit à partir de 50€
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('delivery_rate_1_threshold', '50', 'number', 'Seuil pour livraison gratuite'),
('delivery_rate_1_rate', '0', 'number', 'Tarif livraison gratuite'),
('delivery_rate_1_description', 'Livraison gratuite', 'string', 'Description livraison gratuite');

-- Tarif de livraison 2 : 7€ pour commandes < 50€
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('delivery_rate_2_threshold', '0', 'number', 'Seuil minimum pour livraison payante'),
('delivery_rate_2_rate', '7', 'number', 'Tarif livraison payante'),
('delivery_rate_2_description', 'Commande < 50€ : 7€', 'string', 'Description livraison payante');

-- Vérifier que tout s'est bien passé
SELECT 'Paramètres créés avec succès!' as status, COUNT(*) as total_settings FROM site_settings;