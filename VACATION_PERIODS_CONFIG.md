# Configuration des Périodes de Vacances

## Vue d'ensemble

Le système de périodes de vacances permet à l'administrateur de configurer des périodes où le magasin sera fermé, tout en permettant aux clients de continuer à passer des commandes. Les commandes prises pendant les vacances sont automatiquement reportées 4 jours après le retour de vacances.

## Fonctionnement du système

### 1. Gestion des commandes pendant les vacances
- **Les clients peuvent toujours commander** pendant vos vacances
- **Toutes les commandes prises en période de vacances** sont automatiquement reportées
- **Les dates de retrait disponibles** commencent 4 jours après votre retour
- **Calcul automatique** des dates disponibles en tenant compte des chevauchements de vacances

### 2. Interface d'administration

L'administrateur peut gérer les périodes de vacances depuis :
**Admin Dashboard > Personnalisation > Section "Périodes de vacances"**

#### Fonctionnalités disponibles :
- ✅ **Ajouter des périodes** avec dates de début et fin
- 📝 **Description personnalisée** pour chaque période
- 🔄 **Activer/désactiver** temporairement une période
- 🗑️ **Supprimer** les périodes obsolètes
- 📊 **Statut en temps réel** : indicateur si en vacances actuellement
- 📅 **Aperçu des prochaines vacances**

## Structure des données

### Format JSON des périodes
Chaque période de vacances est stockée au format JSON :

```json
{
  "id": "vacation_summer_2024",
  "startDate": "2024-08-01",
  "endDate": "2024-08-15", 
  "description": "Vacances d'été 2024",
  "isActive": true
}
```

### Propriétés disponibles

- `id` : Identifiant unique de la période (généré automatiquement)
- `startDate` : Date de début au format "YYYY-MM-DD" (obligatoire)
- `endDate` : Date de fin au format "YYYY-MM-DD" (obligatoire)
- `description` : Description de la période (obligatoire)
- `isActive` : Boolean - true si la période est active (obligatoire)

## Configuration en base de données

### Structure de stockage
Les périodes sont stockées dans la table `site_settings` avec :
- **Clé** : `vacation_period_{id}`
- **Valeur** : JSON de la période
- **Type** : `json`

### Exemple de configuration manuelle

```sql
-- Ajouter une période de vacances
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('vacation_period_summer_2024', 
 '{"id":"vacation_summer_2024","startDate":"2024-08-01","endDate":"2024-08-15","description":"Vacances d''été 2024","isActive":true}', 
 'json', 
 'Période de vacances: Vacances d''été 2024');

-- Désactiver une période sans la supprimer
UPDATE site_settings 
SET setting_value = JSON_SET(setting_value, '$.isActive', false)
WHERE setting_key = 'vacation_period_summer_2024';

-- Modifier les dates d'une période
UPDATE site_settings 
SET setting_value = '{"id":"vacation_summer_2024","startDate":"2024-08-05","endDate":"2024-08-20","description":"Vacances d''été 2024 (modifiées)","isActive":true}'
WHERE setting_key = 'vacation_period_summer_2024';
```

## Impact sur les commandes

### Calcul des dates de retrait

#### Logique de calcul :
1. **Date normale** : Aujourd'hui + 4 jours (délai minimum habituel)
2. **Si en vacances** : Fin des vacances + 4 jours
3. **Si chevauchement** : Calcul récursif jusqu'à trouver une date libre

#### Exemples pratiques :

```
Situation : Vacances du 15 au 25 août 2024
Commande passée le : 10 août 2024
Date normale : 14 août 2024 (10 + 4 jours)
Résultat : 29 août 2024 (25 août + 4 jours)

Situation : Vacances du 20 au 30 août + 5 au 10 septembre 2024  
Commande passée le : 25 août 2024
Date normale : 29 août 2024 (25 + 4 jours)
Tombe en vacances : Oui (période 1)
Après vacances 1 : 3 septembre 2024 (30 août + 4 jours)
Tombe en vacances : Oui (période 2)  
Résultat final : 14 septembre 2024 (10 septembre + 4 jours)
```

### Affichage pour les clients

#### Dans le panier (Cart.tsx)
- **Période normale** : "Minimum 4 jours ouvrés de préparation"
- **En vacances** : 
  ```
  🏖️ Période de vacances en cours
  Vacances d'été 2024
  Commandes disponibles à partir du 29/08/2024
  ```

#### Calendrier de sélection
- **Date minimum** calculée automatiquement avec les vacances
- **Dates bloquées** pendant les vacances dans le sélecteur

## Utilisation dans le code

### Hook useVacationPeriods

```tsx
import { useVacationPeriods } from './hooks/useVacationPeriods';

const { 
  vacationPeriods,
  isDateInVacation,
  getEarliestAvailableDate,
  getCurrentVacationStatus 
} = useVacationPeriods();

// Vérifier si une date est en vacances
const vacation = isDateInVacation('2024-08-20');
if (vacation) {
  console.log(`En vacances: ${vacation.description}`);
}

// Obtenir la date la plus proche disponible
const availableDate = getEarliestAvailableDate('2024-08-20');

// Statut actuel
const status = getCurrentVacationStatus();
if (status.isOnVacation) {
  console.log(`En vacances jusqu'au ${status.currentPeriod?.endDate}`);
}
```

### Hook useMinimumPickupDate

```tsx
import { useMinimumPickupDate } from './hooks/useMinimumPickupDate';

const { getMinimumPickupDate, isDateAvailable } = useMinimumPickupDate();

// Date minimum pour le calendrier
const minDate = getMinimumPickupDate(); // Prend en compte les vacances

// Vérifier si une date est valide
const isValid = isDateAvailable('2024-08-25');
```

## Gestion des cas particuliers

### Chevauchement de périodes
Le système gère automatiquement les périodes qui se chevauchent en calculant récursivement la prochaine date disponible.

### Périodes longues
Pour des vacances de plus de 30 jours, le système continue de fonctionner normalement en reportant toutes les commandes après la période.

### Activation/désactivation
- **Désactiver** : Les clients peuvent commander normalement
- **Activer** : Les commandes sont reportées selon les règles

### Modification en cours de période
- Les changements sont appliqués immédiatement
- Les commandes existantes ne sont pas modifiées rétroactivement
- Seules les nouvelles commandes utilisent les nouvelles règles

## Indicateurs visuels

### Interface admin
- 🏖️ **En vacances actuellement** (orange)
- 📅 **Prochaines vacances** (bleu)
- ✅ **Période active** (vert)
- ⚪ **Période désactivée** (gris)

### Interface client
- 🏖️ **Notification de vacances en cours** dans le panier
- 📅 **Dates automatiquement ajustées** dans le calendrier
- 🔒 **Dates bloquées** non sélectionnables

## Maintenance et dépannage

### Problèmes courants
1. **Dates dans le passé** : Le système ignore automatiquement les périodes passées
2. **Chevauchements complexes** : Calcul récursif jusqu'à 1 an maximum
3. **Pas de périodes** : Fonctionnement normal avec délai de 4 jours

### Vérifications recommandées
- Tester les dates de commande pendant les vacances
- Vérifier l'affichage des notifications clients
- Contrôler les calculs avec des périodes multiples
- S'assurer que les dates passées n'interfèrent pas

### Script de maintenance
```sql
-- Supprimer les périodes expirées (plus de 30 jours dans le passé)
DELETE FROM site_settings 
WHERE setting_key LIKE 'vacation_period_%' 
AND JSON_EXTRACT(setting_value, '$.endDate') < DATE('now', '-30 days');
```

## Avantages du système

1. **Continuité de service** : Les clients peuvent commander même pendant vos vacances
2. **Gestion automatique** : Pas besoin de bloquer le site ou gérer manuellement
3. **Transparence** : Les clients savent quand leurs commandes seront disponibles
4. **Flexibilité** : Périodes multiples, activation/désactivation, modifications faciles
5. **Prévention d'erreurs** : Impossible de sélectionner des dates non disponibles