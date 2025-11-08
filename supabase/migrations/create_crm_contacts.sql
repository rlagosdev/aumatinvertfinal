-- Création de la table crm_contacts
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom VARCHAR(255),
  prenom VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  telephone VARCHAR(50),
  adresse TEXT,
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  type_contact VARCHAR(20) CHECK (type_contact IN ('client', 'prospect')) DEFAULT 'prospect',
  nombre_commandes INTEGER DEFAULT 0,
  total_achats DECIMAL(10, 2) DEFAULT 0,
  derniere_commande TIMESTAMP,
  date_premier_contact TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_type ON crm_contacts(type_contact);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_at ON crm_contacts(created_at DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_crm_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_update_crm_contacts_updated_at ON crm_contacts;
CREATE TRIGGER trigger_update_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_contacts_updated_at();

-- Fonction pour synchroniser automatiquement les contacts depuis les commandes
CREATE OR REPLACE FUNCTION sync_contact_from_order()
RETURNS TRIGGER AS $$
DECLARE
  v_contact_id UUID;
  v_order_count INTEGER;
  v_total_spent DECIMAL(10, 2);
BEGIN
  -- Vérifier si le contact existe déjà
  SELECT id INTO v_contact_id
  FROM crm_contacts
  WHERE email = NEW.customer_email;

  -- Si le contact n'existe pas, le créer
  IF v_contact_id IS NULL THEN
    INSERT INTO crm_contacts (
      nom,
      email,
      telephone,
      type_contact,
      nombre_commandes,
      total_achats,
      derniere_commande,
      date_premier_contact
    ) VALUES (
      NEW.customer_name,
      NEW.customer_email,
      NEW.customer_phone,
      'client',
      1,
      NEW.total_amount,
      NEW.created_at,
      NEW.created_at
    )
    RETURNING id INTO v_contact_id;
  ELSE
    -- Si le contact existe, mettre à jour ses statistiques
    SELECT COUNT(*), COALESCE(SUM(total_amount), 0)
    INTO v_order_count, v_total_spent
    FROM commandes
    WHERE customer_email = NEW.customer_email;

    UPDATE crm_contacts
    SET
      nom = COALESCE(NEW.customer_name, nom),
      telephone = COALESCE(NEW.customer_phone, telephone),
      type_contact = 'client',
      nombre_commandes = v_order_count,
      total_achats = v_total_spent,
      derniere_commande = NEW.created_at,
      updated_at = NOW()
    WHERE id = v_contact_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour synchroniser automatiquement les contacts depuis les commandes
DROP TRIGGER IF EXISTS trigger_sync_contact_on_order ON commandes;
CREATE TRIGGER trigger_sync_contact_on_order
  AFTER INSERT ON commandes
  FOR EACH ROW
  EXECUTE FUNCTION sync_contact_from_order();

-- Activer RLS (Row Level Security)
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tout le monde de voir les contacts (à ajuster selon vos besoins)
CREATE POLICY "Enable read access for authenticated users" ON crm_contacts
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour permettre aux admins de tout faire
CREATE POLICY "Enable all access for admins" ON crm_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
