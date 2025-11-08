-- Script d'initialisation des tarifs de livraison
-- À exécuter dans votre base de données Supabase

-- Supprimer les anciens tarifs s'ils existent
DELETE FROM site_settings WHERE setting_key LIKE 'delivery_rate_%';

-- Tarif 1 : Commandes < 50€ = 7€
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_1_min_amount', '0', 'number', 'Montant minimum pour le tarif 1'),
('delivery_rate_1_max_amount', '49.99', 'number', 'Montant maximum pour le tarif 1'),
('delivery_rate_1_rate', '7', 'number', 'Tarif de livraison pour le tarif 1'),
('delivery_rate_1_description', 'Commande < 50€', 'text', 'Description du tarif 1');

-- Tarif 2 : Commandes 50€-99.99€ = 3€
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_2_min_amount', '50', 'number', 'Montant minimum pour le tarif 2'),
('delivery_rate_2_max_amount', '99.99', 'number', 'Montant maximum pour le tarif 2'),
('delivery_rate_2_rate', '3', 'number', 'Tarif de livraison pour le tarif 2'),
('delivery_rate_2_description', 'Commande ≥ 50€', 'text', 'Description du tarif 2');

-- Tarif 3 : Commandes ≥ 100€ = Gratuit
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_3_min_amount', '100', 'number', 'Montant minimum pour le tarif 3'),
('delivery_rate_3_max_amount', 'null', 'text', 'Montant maximum pour le tarif 3 (illimité)'),
('delivery_rate_3_rate', '0', 'number', 'Tarif de livraison pour le tarif 3 (gratuit)'),
('delivery_rate_3_description', 'Commande ≥ 100€', 'text', 'Description du tarif 3');