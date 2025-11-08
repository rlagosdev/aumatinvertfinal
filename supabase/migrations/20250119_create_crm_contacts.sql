-- Table CRM pour gérer les clients et prospects
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom VARCHAR(255),
  prenom VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  telephone VARCHAR(50),
  adresse TEXT,
  type_contact VARCHAR(50) DEFAULT 'prospect' CHECK (type_contact IN ('client', 'prospect')),
  nombre_commandes INTEGER DEFAULT 0,
  total_achats DECIMAL(10, 2) DEFAULT 0,
  derniere_commande TIMESTAMP,
  date_premier_contact TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  tags TEXT[], -- Tags pour catégoriser les contacts
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_type ON crm_contacts(type_contact);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_created_at ON crm_contacts(created_at DESC);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_crm_contacts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_crm_contacts_updated_at();

-- Fonction pour synchroniser automatiquement les données depuis les commandes
CREATE OR REPLACE FUNCTION sync_crm_from_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer ou mettre à jour le contact basé sur l'email de la commande
  INSERT INTO crm_contacts (
    nom,
    prenom,
    email,
    telephone,
    type_contact,
    nombre_commandes,
    total_achats,
    derniere_commande
  )
  VALUES (
    NEW.nom,
    NEW.prenom,
    NEW.email,
    NEW.telephone,
    'client',
    1,
    NEW.total,
    NEW.created_at
  )
  ON CONFLICT (email)
  DO UPDATE SET
    nom = COALESCE(EXCLUDED.nom, crm_contacts.nom),
    prenom = COALESCE(EXCLUDED.prenom, crm_contacts.prenom),
    telephone = COALESCE(EXCLUDED.telephone, crm_contacts.telephone),
    type_contact = 'client',
    nombre_commandes = crm_contacts.nombre_commandes + 1,
    total_achats = crm_contacts.total_achats + NEW.total,
    derniere_commande = NEW.created_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur la table orders pour synchroniser automatiquement
DROP TRIGGER IF EXISTS trigger_sync_crm_from_orders ON orders;
CREATE TRIGGER trigger_sync_crm_from_orders
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION sync_crm_from_orders();

-- Fonction pour ajouter un prospect depuis les messages de contact
CREATE OR REPLACE FUNCTION add_prospect_from_contact()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer le contact comme prospect s'il n'existe pas déjà
  INSERT INTO crm_contacts (
    nom,
    email,
    type_contact,
    notes
  )
  VALUES (
    NEW.nom,
    NEW.email,
    'prospect',
    'Contact via formulaire: ' || NEW.message
  )
  ON CONFLICT (email)
  DO UPDATE SET
    notes = crm_contacts.notes || E'\n\n' || 'Nouveau contact (' || NEW.created_at || '): ' || NEW.message,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur la table contact_messages pour ajouter automatiquement les prospects
DROP TRIGGER IF EXISTS trigger_add_prospect_from_contact ON contact_messages;
CREATE TRIGGER trigger_add_prospect_from_contact
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION add_prospect_from_contact();

COMMENT ON TABLE crm_contacts IS 'Table CRM pour gérer les clients et prospects';
COMMENT ON COLUMN crm_contacts.type_contact IS 'Type de contact: client (a passé commande) ou prospect (juste contacté)';
COMMENT ON COLUMN crm_contacts.nombre_commandes IS 'Nombre total de commandes passées';
COMMENT ON COLUMN crm_contacts.total_achats IS 'Montant total des achats en euros';
