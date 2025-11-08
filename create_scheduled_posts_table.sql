-- Table pour stocker les posts planifiés (multi-utilisateurs)
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  social_account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'facebook' ou 'instagram'
  post_type VARCHAR(50) DEFAULT 'post', -- 'post', 'story', 'reel'
  content TEXT, -- Texte du post
  media_urls TEXT[], -- URLs des images/vidéos
  media_type VARCHAR(20), -- 'image', 'video', 'carousel'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'published', 'failed', 'draft'
  scheduled_at TIMESTAMPTZ, -- Date de publication prévue
  published_at TIMESTAMPTZ, -- Date de publication réelle
  platform_post_id VARCHAR(255), -- ID du post sur la plateforme après publication
  platform_post_url TEXT, -- URL du post publié
  error_message TEXT, -- Message d'erreur si échec
  engagement_stats JSONB, -- Stats d'engagement (likes, comments, shares)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour rechercher rapidement les posts d'un utilisateur
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_social_account_id ON scheduled_posts(social_account_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);

-- Activer RLS (Row Level Security)
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir uniquement LEURS posts
CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent insérer uniquement LEURS posts
CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour uniquement LEURS posts
CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer uniquement LEURS posts
CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_scheduled_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS scheduled_posts_updated_at ON scheduled_posts;
CREATE TRIGGER scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_scheduled_posts_updated_at();

-- Vue pour avoir un résumé des posts par utilisateur
CREATE OR REPLACE VIEW user_posts_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_count,
  COUNT(*) FILTER (WHERE status = 'published') as published_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  MAX(published_at) as last_published_at
FROM scheduled_posts
GROUP BY user_id;
