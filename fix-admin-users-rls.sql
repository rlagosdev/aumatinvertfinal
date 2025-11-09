-- Script de création des politiques RLS pour admin_users
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Admin users are viewable by authenticated users only" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users can update their own data" ON public.admin_users;
DROP POLICY IF EXISTS "Only super admins can insert new admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Only super admins can delete admin users" ON public.admin_users;

-- 1. Politique de lecture : Seuls les utilisateurs authentifiés peuvent voir les admin_users
CREATE POLICY "Admin users are viewable by authenticated users only"
  ON public.admin_users
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Politique de mise à jour : Les admins peuvent mettre à jour leur propre profil
CREATE POLICY "Admin users can update their own data"
  ON public.admin_users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Politique d'insertion : Empêcher l'insertion publique (à gérer via service_role)
-- Cette politique n'autorise personne, donc seul le service_role peut insérer
CREATE POLICY "Only service role can insert admin users"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (false);

-- 4. Politique de suppression : Empêcher la suppression publique (à gérer via service_role)
CREATE POLICY "Only service role can delete admin users"
  ON public.admin_users
  FOR DELETE
  USING (false);

-- Vérification des politiques créées
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
WHERE schemaname = 'public'
  AND tablename = 'admin_users'
ORDER BY policyname;

-- Vérification que RLS est bien activé
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'admin_users';
