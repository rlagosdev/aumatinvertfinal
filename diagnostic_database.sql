-- Script de diagnostic pour vérifier l'état de la base de données

-- 1. Vérifier si la table commandes existe et sa structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'commandes'
ORDER BY ordinal_position;

-- 2. Vérifier si la table commande_items existe et sa structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'commande_items'
ORDER BY ordinal_position;

-- 3. Compter le nombre de commandes
SELECT COUNT(*) as total_commandes FROM commandes;

-- 4. Compter le nombre d'items de commande
SELECT COUNT(*) as total_items FROM commande_items;

-- 5. Afficher les 5 dernières commandes avec leurs informations
SELECT
    id,
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    total_amount,
    payment_status,
    pickup_date,
    created_at
FROM commandes
ORDER BY created_at DESC
LIMIT 5;

-- 6. Vérifier si la colonne pickup_date existe dans commandes
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'commandes'
AND column_name = 'pickup_date';

-- 7. Vérifier les politiques RLS actives
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('commandes', 'commande_items')
ORDER BY tablename, policyname;

-- 8. Vérifier si RLS est activé sur les tables
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('commandes', 'commande_items');
