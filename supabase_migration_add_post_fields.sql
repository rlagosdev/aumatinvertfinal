-- Migration : Ajouter les champs pour les posts publiés
-- À exécuter dans Supabase SQL Editor

-- Ajouter le champ platform_post_id (ID du post sur Facebook/Instagram)
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS platform_post_id TEXT;

-- Ajouter le champ platform_post_url (URL du post publié)
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS platform_post_url TEXT;

-- Ajouter le champ published_at (date de publication réelle)
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Ajouter le champ error_message (message d'erreur si échec)
ALTER TABLE scheduled_posts
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN scheduled_posts.platform_post_id IS 'ID du post sur Facebook/Instagram (ex: 123456789_987654321)';
COMMENT ON COLUMN scheduled_posts.platform_post_url IS 'URL complète du post publié';
COMMENT ON COLUMN scheduled_posts.published_at IS 'Date et heure de publication réelle du post';
COMMENT ON COLUMN scheduled_posts.error_message IS 'Message d''erreur si la publication a échoué';
