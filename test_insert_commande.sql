-- Script de test pour insérer une commande fictive dans la base de données
-- À exécuter APRÈS avoir ajouté la colonne pickup_date avec add_pickup_date_column.sql

-- Insérer une commande de test
INSERT INTO commandes (
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  total_amount,
  delivery_fee,
  subtotal,
  payment_status,
  delivery_method,
  pickup_date
) VALUES (
  'AMV-TEST-12345',
  'Jean Dupont',
  'jean.dupont@example.com',
  '06 12 34 56 78',
  45.50,
  5.00,
  40.50,
  'succeeded',
  'pickup',
  CURRENT_DATE + INTERVAL '3 days'
) RETURNING id;

-- Note: Gardez l'ID retourné pour insérer les items ci-dessous
-- Remplacez 'COMMANDE_ID_ICI' par l'ID réel retourné

-- Exemple d'insertion d'items (décommentez et remplacez l'ID après avoir obtenu celui de la commande)
/*
INSERT INTO commande_items (
  commande_id,
  produit_id,
  produit_nom,
  quantity,
  unit_price,
  total_price,
  pickup_date
) VALUES
(
  'COMMANDE_ID_ICI',
  '00000000-0000-0000-0000-000000000000',
  'Panier de légumes bio',
  2,
  20.25,
  40.50,
  CURRENT_DATE + INTERVAL '3 days'
);
*/
