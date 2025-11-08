-- Créer la table categories si elle n'existe pas
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Politique pour lire les catégories (public)
CREATE POLICY "Lecture publique des catégories" ON categories
  FOR SELECT USING (true);

-- Politique pour les admins (toutes opérations)
CREATE POLICY "Admin peut tout faire sur catégories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer quelques catégories par défaut
INSERT INTO categories (nom, description) VALUES 
  ('Fruits', 'Fruits frais et de saison'),
  ('Légumes', 'Légumes bio et locaux'),
  ('Produits laitiers', 'Fromages, yaourts et laits'),
  ('Épicerie', 'Produits secs et conserves')
ON CONFLICT (nom) DO NOTHING;