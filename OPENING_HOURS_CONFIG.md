# Configuration des Horaires d'Ouverture

## Comment configurer les horaires d'ouverture

Les horaires d'ouverture sont stockés dans la table `site_settings` avec des clés JSON spécifiques.

### Structure des clés

Pour chaque jour, utilisez le format : `opening_hours_{day}`

Où `day` peut être : monday, tuesday, wednesday, thursday, friday, saturday, sunday

### Structure JSON des horaires

Chaque jour a une structure JSON avec les propriétés suivantes :

```json
{
  "day": "Lundi",
  "isOpen": true|false,
  "morning": {
    "open": "08:00",
    "close": "12:45"
  },
  "afternoon": {
    "open": "15:30",
    "close": "19:00"
  }
}
```

### Propriétés disponibles

- `day` : Nom du jour en français (obligatoire)
- `isOpen` : Boolean - true si le magasin est ouvert ce jour-là (obligatoire)
- `morning` : Objet optionnel pour les horaires du matin
  - `open` : Heure d'ouverture au format "HH:MM"
  - `close` : Heure de fermeture au format "HH:MM"
- `afternoon` : Objet optionnel pour les horaires de l'après-midi
  - `open` : Heure d'ouverture au format "HH:MM"
  - `close` : Heure de fermeture au format "HH:MM"

### Exemple de configuration

```sql
-- Jour ouvert avec matin et après-midi
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_tuesday', 
 '{"day":"Mardi","isOpen":true,"morning":{"open":"08:00","close":"12:45"},"afternoon":{"open":"15:30","close":"19:00"}}', 
 'json', 
 'Horaires d''ouverture pour Mardi');

-- Jour fermé
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_monday', 
 '{"day":"Lundi","isOpen":false}', 
 'json', 
 'Horaires d''ouverture pour Lundi');

-- Jour ouvert uniquement le matin
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('opening_hours_saturday', 
 '{"day":"Samedi","isOpen":true,"morning":{"open":"08:00","close":"13:00"}}', 
 'json', 
 'Horaires d''ouverture pour Samedi');
```

### Modification des horaires

Pour modifier les horaires d'un jour existant :

```sql
-- Exemple : Changer les horaires du mardi
UPDATE site_settings 
SET setting_value = '{"day":"Mardi","isOpen":true,"morning":{"open":"09:00","close":"13:00"},"afternoon":{"open":"14:00","close":"18:00"}}'
WHERE setting_key = 'opening_hours_tuesday';

-- Exemple : Fermer le magasin le lundi
UPDATE site_settings 
SET setting_value = '{"day":"Lundi","isOpen":false}'
WHERE setting_key = 'opening_hours_monday';
```

### Horaires par défaut

Si aucune configuration n'est trouvée en base de données, le système utilise ces horaires par défaut :

- **Lundi** : Fermé
- **Mardi** : 08:00-12:45 / 15:30-19:00
- **Mercredi** : 08:00-12:45 / 15:30-19:00
- **Jeudi** : 08:00-12:45 / 15:30-19:00
- **Vendredi** : 08:00-12:45 / 15:30-19:00
- **Samedi** : 08:00-13:00 / 15:30-19:00
- **Dimanche** : Fermé

### Interface d'administration

L'administrateur peut modifier les horaires directement depuis :
**Admin Dashboard > Personnalisation > Section "Horaires d'ouverture"**

Fonctionnalités disponibles :
- ✅ Cocher/décocher "Ouvert" pour chaque jour
- 🌅 Activer/désactiver les créneaux matin et après-midi
- ⏰ Définir les heures d'ouverture et fermeture
- 👁️ Aperçu en temps réel des horaires configurés
- 💾 Sauvegarde automatique avec les autres paramètres du site

### Affichage sur le site

#### Indicateur de statut en temps réel

Le système affiche automatiquement si le magasin est ouvert ou fermé :

- 🟢 **Ouvert maintenant** (avec l'heure de fermeture prochaine)
- 🔴 **Fermé** (avec la prochaine heure d'ouverture)

L'indicateur se met à jour automatiquement chaque minute.

#### Emplacements d'affichage

Les horaires sont affichés dynamiquement sur :
- **Page Services** - Avec indicateur de statut ouvert/fermé
- **Footer du site** - Affichage simple des horaires
- **Composant réutilisable** `<OpeningHours />`

### Utilisation dans le code

#### Composant OpeningHours

```tsx
import OpeningHours from './components/OpeningHours';

// Avec indicateur de statut
<OpeningHours showStatus={true} />

// Sans indicateur (pour footer)
<OpeningHours showStatus={false} theme="dark" />
```

#### Hook useOpeningHours

```tsx
import { useOpeningHours } from './hooks/useOpeningHours';

const { isCurrentlyOpen, getDisplaySchedule } = useOpeningHours();

// Vérifier si ouvert maintenant
const { isOpen, nextChange } = isCurrentlyOpen();

// Obtenir les horaires formatés
const schedule = getDisplaySchedule();
```

### Notes importantes

1. **Format d'heure** : Utilisez toujours le format 24h "HH:MM" (ex: "08:00", "19:00")
2. **Mise à jour temps réel** : Le statut ouvert/fermé se met à jour automatiquement
3. **Sauvegarde** : Les changements via l'interface admin sont sauvegardés immédiatement
4. **Fallback** : Si la base de données n'est pas configurée, les horaires par défaut s'appliquent
5. **Flexibilité** : Chaque jour peut avoir des horaires différents et des créneaux optionnels

### Dépannage

- Si les horaires ne s'affichent pas, vérifiez que la table `site_settings` existe
- Pour réinitialiser aux valeurs par défaut, exécutez le script `init_opening_hours.sql`
- Les erreurs de format JSON empêcheront le chargement des horaires