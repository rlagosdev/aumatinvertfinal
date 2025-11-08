-- Script pour mettre à jour la colonne pickup_date des commandes existantes
-- en récupérant la date de retrait la plus tardive parmi leurs items

-- 1. Afficher les commandes sans pickup_date
SELECT
    c.id,
    c.order_number,
    c.customer_name,
    c.pickup_date as current_pickup_date,
    MAX(ci.pickup_date) as latest_item_pickup_date
FROM commandes c
LEFT JOIN commande_items ci ON c.id = ci.commande_id
WHERE c.pickup_date IS NULL
GROUP BY c.id, c.order_number, c.customer_name, c.pickup_date;

-- 2. Mettre à jour toutes les commandes sans pickup_date
-- en utilisant la date la plus tardive de leurs items
UPDATE commandes c
SET pickup_date = (
    SELECT MAX(ci.pickup_date)
    FROM commande_items ci
    WHERE ci.commande_id = c.id
    AND ci.pickup_date IS NOT NULL
)
WHERE c.pickup_date IS NULL
AND EXISTS (
    SELECT 1
    FROM commande_items ci
    WHERE ci.commande_id = c.id
    AND ci.pickup_date IS NOT NULL
);

-- 3. Vérifier le résultat après la mise à jour
SELECT
    c.id,
    c.order_number,
    c.customer_name,
    c.customer_email,
    c.customer_phone,
    c.pickup_date,
    c.payment_status,
    c.total_amount,
    c.created_at
FROM commandes c
ORDER BY c.created_at DESC;

-- 4. Afficher les commandes qui n'ont toujours pas de pickup_date
-- (celles qui n'ont pas d'items avec pickup_date)
SELECT
    c.id,
    c.order_number,
    c.customer_name,
    c.created_at
FROM commandes c
WHERE c.pickup_date IS NULL;
