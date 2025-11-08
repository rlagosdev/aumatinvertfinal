# Configuration des Tarifs de Livraison

## Comment configurer les tarifs de livraison

Les tarifs de livraison sont stockés dans la table `site_settings` avec des clés spécifiques.

### Structure des clés

Pour chaque tarif, utilisez le format : `delivery_rate_{index}_{propriété}`

Où :
- `index` : numéro du tarif (1, 2, 3, etc.)
- `propriété` : min_amount, max_amount, rate, description

### Propriétés disponibles

- `min_amount` : Montant minimum de la commande (nombre)
- `max_amount` : Montant maximum de la commande (nombre ou "null" pour infini)
- `rate` : Tarif de livraison en euros (nombre, 0 pour gratuit)
- `description` : Description du tarif (texte)

### Exemple de configuration

```sql
-- Tarif 1 : Commandes < 50€ = 7€
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_1_min_amount', '0', 'number', 'Montant minimum pour le tarif 1'),
('delivery_rate_1_max_amount', '49.99', 'number', 'Montant maximum pour le tarif 1'),
('delivery_rate_1_rate', '7', 'number', 'Tarif de livraison pour le tarif 1'),
('delivery_rate_1_description', 'Commande < 50€', 'text', 'Description du tarif 1');

-- Tarif 2 : Commandes 50€-99.99€ = 3€
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_2_min_amount', '50', 'number', 'Montant minimum pour le tarif 2'),
('delivery_rate_2_max_amount', '99.99', 'number', 'Montant maximum pour le tarif 2'),
('delivery_rate_2_rate', '3', 'number', 'Tarif de livraison pour le tarif 2'),
('delivery_rate_2_description', 'Commande ≥ 50€', 'text', 'Description du tarif 2');

-- Tarif 3 : Commandes ≥ 100€ = Gratuit
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_3_min_amount', '100', 'number', 'Montant minimum pour le tarif 3'),
('delivery_rate_3_max_amount', 'null', 'text', 'Montant maximum pour le tarif 3 (illimité)'),
('delivery_rate_3_rate', '0', 'number', 'Tarif de livraison pour le tarif 3 (gratuit)'),
('delivery_rate_3_description', 'Commande ≥ 100€', 'text', 'Description du tarif 3');
```

### Modification des tarifs

Pour modifier un tarif existant, mettez à jour la valeur correspondante :

```sql
-- Exemple : Changer le tarif pour les commandes < 50€ de 7€ à 8€
UPDATE site_settings 
SET setting_value = '8' 
WHERE setting_key = 'delivery_rate_1_rate';

-- Exemple : Changer le seuil de gratuité de 100€ à 80€
UPDATE site_settings 
SET setting_value = '80' 
WHERE setting_key = 'delivery_rate_3_min_amount';

UPDATE site_settings 
SET setting_value = 'Commande ≥ 80€' 
WHERE setting_key = 'delivery_rate_3_description';
```

### Ajouter un nouveau tarif

Pour ajouter un tarif supplémentaire (par exemple tarif 4) :

```sql
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('delivery_rate_4_min_amount', '150', 'number', 'Montant minimum pour le tarif 4'),
('delivery_rate_4_max_amount', 'null', 'text', 'Montant maximum pour le tarif 4'),
('delivery_rate_4_rate', '0', 'number', 'Livraison premium gratuite'),
('delivery_rate_4_description', 'Commande ≥ 150€ (Premium)', 'text', 'Description du tarif 4');
```

### Tarifs par défaut

Si aucune configuration n'est trouvée en base de données, le système utilise ces tarifs par défaut :
- Commande < 50€ : 7€
- Commande ≥ 50€ : 3€
- Commande ≥ 100€ : Gratuit

### Notes importantes

1. **Ordre d'affichage** : Les tarifs sont affichés dans l'ordre croissant des index (1, 2, 3...)
2. **Chevauchements** : Évitez les chevauchements entre les tranches de prix
3. **Valeur null** : Pour un montant maximum illimité, utilisez la chaîne "null"
4. **Tarif gratuit** : Pour une livraison gratuite, utilisez rate = 0

### Utilisation dans le code

Le système est automatiquement utilisé dans :
- Page Services et Livraison
- Calcul des frais de livraison dans le panier
- Composant `DeliveryRates`
- Hook `useDeliveryRates`