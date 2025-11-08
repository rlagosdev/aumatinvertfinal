# Debug Chatbot - Pourquoi le chatbot n'apparaît pas ?

## Étapes de vérification :

### 1. Vérifier que la clé API est bien sauvegardée en base de données

Ouvrez la console du navigateur (F12) et exécutez ce code :

```javascript
// Vérifier si la clé existe en base
const { data, error } = await supabase
  .from('site_settings')
  .select('*')
  .eq('setting_key', 'chatbot_api_key')
  .maybeSingle();

console.log('Clé API chatbot:', data);
console.log('Erreur:', error);
```

### 2. Vérifier que le composant ChatbotAssistant charge la clé

Dans la console du navigateur :

```javascript
// Le composant devrait charger la clé au démarrage
// Vérifiez les logs dans la console
```

### 3. Rafraîchir la page après avoir sauvegardé

**IMPORTANT** : Après avoir sauvegardé la clé API dans les paramètres, vous devez **rafraîchir complètement la page** (F5 ou Ctrl+R) pour que le composant ChatbotAssistant recharge la clé depuis la base de données.

### 4. Vérifier que la table site_settings existe

```sql
-- Dans Supabase SQL Editor
SELECT * FROM site_settings WHERE setting_key = 'chatbot_api_key';
```

### 5. Vérifier la structure de la clé API

La clé doit commencer par : `sk-ant-api03-`

## Solutions rapides :

### Solution 1 : Rafraîchir la page
Après avoir sauvegardé la clé API, appuyez sur **F5** pour recharger la page complètement.

### Solution 2 : Vider le cache
1. Ouvrez les outils de développement (F12)
2. Faites un clic droit sur le bouton de rafraîchissement
3. Sélectionnez "Vider le cache et actualiser"

### Solution 3 : Vérifier dans la console
Ouvrez la console (F12) et cherchez des messages d'erreur comme :
- "Erreur lors du chargement de la clé API"
- "Table site_settings not found"
- Autres erreurs

## Code pour forcer le rechargement de la clé

Si le chatbot ne s'affiche toujours pas, ajoutez ce code temporairement dans la console :

```javascript
// Forcer le rechargement du composant
window.location.reload();
```

## Vérification manuelle

Voici le code qui s'exécute au chargement du ChatbotAssistant :

```typescript
useEffect(() => {
  const fetchApiKey = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'chatbot_api_key')
        .maybeSingle();

      if (error) {
        console.warn('Erreur lors du chargement de la clé API:', error);
      } else if (data?.setting_value) {
        setApiKey(data.setting_value);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoadingApiKey(false);
    }
  };

  fetchApiKey();
}, []);
```

Ce code s'exécute une seule fois au chargement de la page. Si vous avez sauvegardé la clé après le chargement, vous devez recharger la page.
