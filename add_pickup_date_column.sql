-- Ajouter la colonne pickup_date à la table commandes
ALTER TABLE commandes
ADD COLUMN IF NOT EXISTS pickup_date DATE;

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_commandes_pickup_date ON commandes(pickup_date);

-- Commenter la colonne
COMMENT ON COLUMN commandes.pickup_date IS 'Date de retrait de la commande (date la plus tardive parmi tous les items)';
