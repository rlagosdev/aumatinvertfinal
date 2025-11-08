-- Table pour stocker les comptes sociaux connectés (multi-utilisateurs)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- 'facebook' ou 'instagram'
  platform_user_id VARCHAR(255) NOT NULL, -- ID du compte sur la plateforme
  platform_username VARCHAR(255), -- Nom d'utilisateur sur la plateforme
  page_name VARCHAR(255), -- Nom de la page Facebook ou compte Instagram
  access_token TEXT NOT NULL, -- Token d'accès OAuth
  token_expires_at TIMESTAMPTZ, -- Date d'expiration du token
  refresh_token TEXT, -- Token de rafraîchissement (si disponible)
  profile_picture_url TEXT, -- Photo de profil
  is_active BOOLEAN DEFAULT true, -- Compte actif ou non
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, platform_user_id)
);

-- Index pour rechercher rapidement les comptes d'un utilisateur
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);

-- Activer RLS (Row Level Security)
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir uniquement LEURS comptes
CREATE POLICY "Users can view their own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent insérer uniquement LEURS comptes
CREATE POLICY "Users can insert their own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour uniquement LEURS comptes
CREATE POLICY "Users can update their own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer uniquement LEURS comptes
CREATE POLICY "Users can delete their own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_social_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS social_accounts_updated_at ON social_accounts;
CREATE TRIGGER social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_social_accounts_updated_at();
