-- Table pour les rendez-vous de visio/audio
CREATE TABLE IF NOT EXISTS video_call_appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  call_type VARCHAR(20) DEFAULT 'video' CHECK (call_type IN ('video', 'audio', 'both')),
  reason TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour gérer la disponibilité admin pour les appels directs
CREATE TABLE IF NOT EXISTS admin_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT false,
  status_message VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_appointments_date ON video_call_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON video_call_appointments(status);
CREATE INDEX IF NOT EXISTS idx_admin_availability_admin_id ON admin_availability(admin_id);

-- Activer Row Level Security
ALTER TABLE video_call_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_availability ENABLE ROW LEVEL SECURITY;

-- Politiques pour video_call_appointments
-- Les administrateurs peuvent tout voir et modifier
CREATE POLICY "Admins can view all appointments" ON video_call_appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert appointments" ON video_call_appointments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update appointments" ON video_call_appointments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Les clients peuvent créer des rendez-vous
CREATE POLICY "Anyone can create appointments" ON video_call_appointments
  FOR INSERT
  WITH CHECK (true);

-- Politiques pour admin_availability
-- Tout le monde peut voir la disponibilité
CREATE POLICY "Anyone can view availability" ON admin_availability
  FOR SELECT
  USING (true);

-- Seuls les admins peuvent modifier leur disponibilité
CREATE POLICY "Admins can update their availability" ON admin_availability
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_video_call_appointments_updated_at ON video_call_appointments;
CREATE TRIGGER update_video_call_appointments_updated_at
  BEFORE UPDATE ON video_call_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_availability_updated_at ON admin_availability;
CREATE TRIGGER update_admin_availability_updated_at
  BEFORE UPDATE ON admin_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insérer une entrée de disponibilité par défaut pour le premier admin
INSERT INTO admin_availability (admin_id, is_available, status_message)
SELECT id, false, 'Non disponible pour le moment'
FROM auth.users
WHERE id IN (SELECT id FROM profiles WHERE role = 'admin')
ON CONFLICT DO NOTHING;
