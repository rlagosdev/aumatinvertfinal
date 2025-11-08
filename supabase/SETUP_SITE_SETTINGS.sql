-- Table pour les paramètres du site
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value BOOLEAN DEFAULT true,
  description TEXT,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Insérer le paramètre pour la boutique
INSERT INTO site_settings (setting_key, setting_value, description)
VALUES ('shop_enabled', true, 'Active ou désactive la page boutique pour les clients')
ON CONFLICT (setting_key) DO NOTHING;

-- Activer Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique (pour que les clients puissent vérifier si la boutique est active)
CREATE POLICY "Allow public read access to site_settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Policy pour permettre aux admins de modifier (tu devras ajuster selon ton système d'auth)
CREATE POLICY "Allow authenticated users to update site_settings"
  ON site_settings
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert site_settings"
  ON site_settings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement updated_at
DROP TRIGGER IF EXISTS trigger_update_site_settings_updated_at ON site_settings;
CREATE TRIGGER trigger_update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();
