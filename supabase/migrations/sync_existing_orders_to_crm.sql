-- Script pour synchroniser les commandes existantes avec le CRM
-- À exécuter UNE SEULE FOIS après avoir créé la table crm_contacts

-- Insérer tous les clients uniques depuis les commandes existantes
INSERT INTO crm_contacts (
  email,
  type_contact,
  nombre_commandes,
  total_achats,
  derniere_commande,
  date_premier_contact
)
SELECT
  c.customer_email as email,
  'client' as type_contact,
  COUNT(*) as nombre_commandes,
  COALESCE(SUM(c.total_amount), 0) as total_achats,
  MAX(c.created_at) as derniere_commande,
  MIN(c.created_at) as date_premier_contact
FROM commandes c
WHERE c.customer_email IS NOT NULL
  AND c.customer_email != ''
  AND NOT EXISTS (
    -- Éviter les doublons si le contact existe déjà
    SELECT 1 FROM crm_contacts cr WHERE cr.email = c.customer_email
  )
GROUP BY c.customer_email
ORDER BY date_premier_contact DESC;

-- Mettre à jour les noms et téléphones depuis la dernière commande de chaque client
UPDATE crm_contacts
SET
  nom = subquery.customer_name,
  telephone = subquery.customer_phone
FROM (
  SELECT DISTINCT ON (customer_email)
    customer_email,
    customer_name,
    customer_phone
  FROM commandes
  WHERE customer_email IS NOT NULL
  ORDER BY customer_email, created_at DESC
) AS subquery
WHERE crm_contacts.email = subquery.customer_email;

-- Afficher le résultat
SELECT
  COUNT(*) as contacts_importes,
  SUM(nombre_commandes) as total_commandes,
  SUM(total_achats) as chiffre_affaires_total
FROM crm_contacts;
