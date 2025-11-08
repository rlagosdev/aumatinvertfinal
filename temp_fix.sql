-- Script SQL à exécuter dans Supabase pour corriger les problèmes
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- 1. Créer la table categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS sur categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 3. Politiques pour categories
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 4. Ajouter les colonnes manquantes à products si elles n'existent pas
ALTER TABLE products ADD COLUMN IF NOT EXISTS delai_retrait_valeur INTEGER DEFAULT 4;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delai_retrait_unite VARCHAR(20) DEFAULT 'jours';

-- 5. Insérer quelques catégories par défaut
INSERT INTO categories (nom, description) VALUES 
  ('Fruits', 'Fruits frais et de saison'),
  ('Légumes', 'Légumes bio et locaux'),
  ('Produits laitiers', 'Fromages, yaourts et laits'),
  ('Épicerie', 'Produits secs et conserves')
ON CONFLICT (nom) DO NOTHING;