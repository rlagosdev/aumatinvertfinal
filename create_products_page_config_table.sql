-- Créer la table pour la configuration de la page produits
CREATE TABLE IF NOT EXISTS products_page_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  page_title TEXT NOT NULL DEFAULT 'Nos Produits',
  custom_orders_title TEXT NOT NULL DEFAULT 'Besoin d''une idée cadeau ou d''un buffet gourmand ?',
  custom_orders_description TEXT NOT NULL DEFAULT 'Nous préparons sur commande :',
  custom_order_item_1 TEXT NOT NULL DEFAULT 'Corbeilles de fruits frais',
  custom_order_item_2 TEXT NOT NULL DEFAULT 'Plateaux apéritifs ou fromagers',
  custom_order_item_3 TEXT NOT NULL DEFAULT 'Assortiments sur mesure selon vos envies',
  store_info_text TEXT NOT NULL DEFAULT '📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain • 🚚 Livraison possible dans un rayon de 3km',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la configuration par défaut
INSERT INTO products_page_config (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Créer un index
CREATE INDEX IF NOT EXISTS idx_products_page_config_id ON products_page_config(id);

-- Ajouter un commentaire
COMMENT ON TABLE products_page_config IS 'Configuration des textes et messages de la page produits';

-- RLS (Row Level Security)
ALTER TABLE products_page_config ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre à tout le monde de lire
CREATE POLICY "Allow public read access" ON products_page_config
  FOR SELECT
  USING (true);

-- Policy pour permettre uniquement aux admins de modifier
CREATE POLICY "Allow admin update access" ON products_page_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
