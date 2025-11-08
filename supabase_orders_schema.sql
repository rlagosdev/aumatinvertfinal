-- Table pour stocker les commandes
CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  delivery_method TEXT DEFAULT 'pickup',
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour stocker les items de chaque commande
CREATE TABLE IF NOT EXISTS commande_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id UUID NOT NULL,
  produit_nom TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  pickup_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_commandes_customer_email ON commandes(customer_email);
CREATE INDEX IF NOT EXISTS idx_commandes_order_number ON commandes(order_number);
CREATE INDEX IF NOT EXISTS idx_commandes_created_at ON commandes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commande_items_commande_id ON commande_items(commande_id);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_commandes_updated_at
  BEFORE UPDATE ON commandes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Activer Row Level Security (RLS)
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_items ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de créer des commandes
CREATE POLICY "Allow public to insert orders" ON commandes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to insert order items" ON commande_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Politique pour permettre aux admin de voir toutes les commandes
CREATE POLICY "Allow authenticated users to view all orders" ON commandes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view all order items" ON commande_items
  FOR SELECT TO authenticated
  USING (true);

-- Commentaires sur les tables
COMMENT ON TABLE commandes IS 'Table principale pour stocker les commandes clients';
COMMENT ON TABLE commande_items IS 'Table pour stocker les produits de chaque commande';
