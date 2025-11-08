-- Activer RLS sur la table commandes (si pas déjà fait)
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow anonymous insert orders" ON commandes;
DROP POLICY IF EXISTS "Allow public insert orders" ON commandes;
DROP POLICY IF EXISTS "Anyone can insert orders" ON commandes;

-- Créer une policy pour permettre à tout le monde (anon) d'insérer des commandes
CREATE POLICY "Allow anonymous to insert orders" ON commandes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Créer une policy pour permettre aux admins de tout voir
CREATE POLICY "Allow authenticated to view their orders" ON commandes
FOR SELECT
TO authenticated
USING (true);

-- Policy pour permettre aux utilisateurs anonymes de ne rien voir (sécurité)
CREATE POLICY "Deny anonymous to view orders" ON commandes
FOR SELECT
TO anon
USING (false);

-- Vérifier les policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'commandes';
