-- Script pour vérifier et corriger les permissions RLS sur les tables commandes

-- 1. Vérifier si RLS est activé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('commandes', 'commande_items');

-- 2. Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Allow public to insert orders" ON commandes;
DROP POLICY IF EXISTS "Allow public to insert order items" ON commande_items;
DROP POLICY IF EXISTS "Allow authenticated users to view all orders" ON commandes;
DROP POLICY IF EXISTS "Allow authenticated users to view all order items" ON commande_items;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON commandes;

-- 3. Créer les nouvelles politiques pour l'insertion (accessible à tous)
CREATE POLICY "Allow public to insert orders" ON commandes
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to insert order items" ON commande_items
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. Créer les politiques pour la lecture (accessible aux utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to view all orders" ON commandes
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to view all order items" ON commande_items
  FOR SELECT TO authenticated
  USING (true);

-- 5. Créer les politiques pour la mise à jour (accessible aux utilisateurs authentifiés)
CREATE POLICY "Allow authenticated users to update orders" ON commandes
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Vérifier que RLS est bien activé
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_items ENABLE ROW LEVEL SECURITY;

-- 7. Afficher toutes les politiques créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('commandes', 'commande_items')
ORDER BY tablename, policyname;
