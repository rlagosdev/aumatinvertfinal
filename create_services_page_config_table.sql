-- Script pour créer la table de configuration de la page Services & Livraison
-- À exécuter dans Supabase SQL Editor

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS services_page_config (
  id INTEGER PRIMARY KEY DEFAULT 1,

  -- En-tête de la page
  page_title TEXT NOT NULL DEFAULT 'Services & Livraison',
  page_description TEXT NOT NULL DEFAULT 'Découvrez nos différents services : retrait en magasin, livraison à domicile, et nos offres spéciales pour les seniors et entreprises.',

  -- Service Seniors
  seniors_title TEXT NOT NULL DEFAULT 'Service Seniors',
  seniors_description TEXT NOT NULL DEFAULT 'Service dédié aux personnes âgées de 65 ans et plus.',
  seniors_image TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  seniors_phone_label TEXT NOT NULL DEFAULT 'Commande par téléphone',

  -- Service Entreprises
  business_title TEXT NOT NULL DEFAULT 'Service Entreprises',
  business_description TEXT NOT NULL DEFAULT 'Solutions sur mesure pour vos événements professionnels.',
  business_image TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
  business_email_label TEXT NOT NULL DEFAULT 'Devis personnalisé',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la configuration par défaut si elle n'existe pas
INSERT INTO services_page_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS (Row Level Security)
ALTER TABLE services_page_config ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire
CREATE POLICY "Public can read services page config"
ON services_page_config
FOR SELECT
TO public
USING (true);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Only admins can update services page config"
ON services_page_config
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Vérification
SELECT * FROM services_page_config;
