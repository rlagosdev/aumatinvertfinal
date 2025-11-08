-- Ajouter les colonnes pour stocker les informations de salle Daily.co
ALTER TABLE video_call_appointments
ADD COLUMN IF NOT EXISTS room_url TEXT,
ADD COLUMN IF NOT EXISTS room_name TEXT;

-- Index pour rechercher rapidement par room_name
CREATE INDEX IF NOT EXISTS idx_appointments_room_name ON video_call_appointments(room_name);
