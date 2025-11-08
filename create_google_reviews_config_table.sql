-- Script pour créer la table de configuration Google Reviews
-- À exécuter dans Supabase SQL Editor

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS google_reviews_config (
  id INTEGER PRIMARY KEY DEFAULT 1,

  -- Configuration Google
  place_id TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT 'Au Matin Vert',
  direct_link TEXT DEFAULT '',

  -- Paramètres d'affichage
  show_on_homepage BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la configuration par défaut si elle n'existe pas
INSERT INTO google_reviews_config (id, business_name)
VALUES (1, 'Au Matin Vert')
ON CONFLICT (id) DO NOTHING;

-- Activer RLS (Row Level Security)
ALTER TABLE google_reviews_config ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire
CREATE POLICY "Public can read google reviews config"
ON google_reviews_config
FOR SELECT
TO public
USING (true);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Only admins can update google reviews config"
ON google_reviews_config
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
SELECT * FROM google_reviews_config;
