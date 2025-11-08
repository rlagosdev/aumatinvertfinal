-- Script pour créer la table des avis Google (gestion manuelle)
-- À exécuter dans Supabase SQL Editor

-- Créer la table des avis individuels
CREATE TABLE IF NOT EXISTS google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Informations sur l'auteur
  author_name TEXT NOT NULL,
  author_photo_url TEXT,

  -- Contenu de l'avis
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  review_date DATE NOT NULL,

  -- Métadonnées
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer un index sur is_active et display_order pour les requêtes de tri
CREATE INDEX IF NOT EXISTS idx_google_reviews_active_order
ON google_reviews(is_active, display_order DESC, review_date DESC);

-- Activer RLS (Row Level Security)
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire les avis actifs
CREATE POLICY "Public can read active google reviews"
ON google_reviews
FOR SELECT
TO public
USING (is_active = true);

-- Politique : Seuls les admins peuvent tout lire
CREATE POLICY "Admins can read all google reviews"
ON google_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Politique : Seuls les admins peuvent insérer
CREATE POLICY "Only admins can insert google reviews"
ON google_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Only admins can update google reviews"
ON google_reviews
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Politique : Seuls les admins peuvent supprimer
CREATE POLICY "Only admins can delete google reviews"
ON google_reviews
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insérer quelques exemples d'avis (vous pouvez les modifier avec vos vrais avis)
INSERT INTO google_reviews (author_name, rating, review_text, review_date, display_order, is_active) VALUES
('Marie Dupont', 5, 'Excellents produits frais et locaux ! Le service est impeccable et l''équipe est très accueillante. Je recommande vivement !', '2024-02-15', 1, true),
('Jean Martin', 5, 'Super boutique avec des produits de qualité. Les fruits et légumes sont toujours frais. Un vrai plaisir de faire ses courses ici.', '2024-02-10', 2, true),
('Sophie Bernard', 5, 'Très bonne adresse pour des produits bio et locaux. Les prix sont corrects et le personnel est aux petits soins. Je suis devenue cliente régulière !', '2024-02-05', 3, true)
ON CONFLICT DO NOTHING;

-- Vérification
SELECT * FROM google_reviews ORDER BY display_order, review_date DESC;
