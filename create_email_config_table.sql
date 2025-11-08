-- Table de configuration pour l'email Roundcube
CREATE TABLE IF NOT EXISTS email_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  roundcube_url TEXT DEFAULT '',
  use_roundcube BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la configuration par défaut
INSERT INTO email_config (id, roundcube_url, use_roundcube)
VALUES (1, '', false)
ON CONFLICT (id) DO NOTHING;

-- Activer RLS (Row Level Security)
ALTER TABLE email_config ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut lire
CREATE POLICY "Allow public read access"
  ON email_config FOR SELECT
  TO public
  USING (true);

-- Politique : Seuls les admins peuvent modifier
CREATE POLICY "Allow admin update"
  ON email_config FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Politique : Seuls les admins peuvent insérer
CREATE POLICY "Allow admin insert"
  ON email_config FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_email_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS email_config_updated_at ON email_config;
CREATE TRIGGER email_config_updated_at
  BEFORE UPDATE ON email_config
  FOR EACH ROW
  EXECUTE FUNCTION update_email_config_updated_at();
