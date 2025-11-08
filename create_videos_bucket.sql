-- Script SQL pour créer le bucket Supabase Storage pour les vidéos
-- À exécuter dans le SQL Editor de votre dashboard Supabase

-- 1. Créer le bucket 'videos' s'il n'existe pas déjà
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Créer une politique pour permettre l'upload public (authentifié)
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- 3. Créer une politique pour permettre la lecture publique
CREATE POLICY "Public can view videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'videos');

-- 4. Créer une politique pour permettre la suppression (par les utilisateurs authentifiés)
CREATE POLICY "Authenticated users can delete their own videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = owner);

-- 5. Créer une politique pour permettre la mise à jour
CREATE POLICY "Authenticated users can update their own videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'videos' AND auth.uid()::text = owner);

-- Note: Si vous obtenez une erreur "policy already exists", c'est normal.
-- Cela signifie que les politiques ont déjà été créées.
