# Gestion des Images des Services Spécialisés

## 📋 Vue d'ensemble

Ce document explique comment gérer les images des deux services spécialisés affichés sur la page **Services & Livraison** :
- 🧓 **Service Seniors** : Livraison gratuite pour les personnes âgées de 65+ ans
- 🏢 **Service Entreprises** : Solutions professionnelles pour événements d'entreprise

---

## 🎯 Accès à la Gestion

### Via l'Administration

1. Connectez-vous à l'administration
2. Cliquez sur **"Paramètres"** dans le menu latéral
3. Sélectionnez la section **"Services"**
4. Vous verrez les deux zones de gestion d'images

---

## 📸 Images Gérées

### 1. Service Seniors
- **Clé** : `service_seniors_image`
- **Utilisation** : Illustre le service dédié aux personnes âgées
- **Recommandations** :
  - Image montrant une livraison attentionnée à une personne âgée
  - Ambiance chaleureuse et rassurante
  - Montre l'aide au portage et le contact humain
  - Format recommandé : 1200x800 pixels

**Image par défaut** :
```
https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80
```

### 2. Service Entreprises
- **Clé** : `service_business_image`
- **Utilisation** : Illustre le service professionnel B2B
- **Recommandations** :
  - Image montrant une camionnette de livraison professionnelle
  - Ambiance dynamique et professionnelle
  - Montre l'aspect logistique et organisé
  - Format recommandé : 1200x800 pixels

**Image par défaut** :
```
https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80
```

---

## 🔧 Installation / Configuration Initiale

### 1. Créer les Entrées en Base de Données

Exécutez le script SQL dans Supabase SQL Editor :

```bash
add_service_images.sql
```

Ce script crée deux nouvelles entrées dans la table `site_settings` :
- `service_seniors_image`
- `service_business_image`

### 2. Vérifier l'Accès depuis l'Admin

1. Allez dans **Administration → Paramètres → Services**
2. Vérifiez que vous voyez les deux sections
3. Les images par défaut devraient être visibles dans les aperçus

---

## 💡 Comment Modifier les Images

### Méthode 1 : Via l'Interface Admin (Recommandé)

1. Allez dans **Administration → Paramètres**
2. Cliquez sur la carte **"Services"**
3. Pour chaque service :
   - Collez l'URL de votre image dans le champ
   - L'aperçu s'affiche automatiquement à droite
   - Vérifiez que l'image s'affiche correctement
4. Cliquez sur **"Sauvegarder"** en haut à droite
5. Les modifications sont appliquées immédiatement sur le site

### Méthode 2 : Directement en Base de Données

Si vous préférez modifier directement dans Supabase :

```sql
-- Modifier l'image Service Seniors
UPDATE site_settings
SET setting_value = 'VOTRE_URL_ICI'
WHERE setting_key = 'service_seniors_image';

-- Modifier l'image Service Entreprises
UPDATE site_settings
SET setting_value = 'VOTRE_URL_ICI'
WHERE setting_key = 'service_business_image';
```

---

## 📦 Structure Technique

### Base de Données

Les images sont stockées dans la table `site_settings` :

| Colonne | Type | Description |
|---------|------|-------------|
| `setting_key` | TEXT | `service_seniors_image` ou `service_business_image` |
| `setting_value` | TEXT | URL de l'image |
| `setting_type` | TEXT | `image_url` |
| `description` | TEXT | Description du paramètre |

### Code Frontend

**Chargement des Images** (`Services.tsx`) :

```typescript
const [serviceSeniorsImage, setServiceSeniorsImage] = useState<string>('');
const [serviceBusinessImage, setServiceBusinessImage] = useState<string>('');

const fetchServiceImages = async () => {
  const { data } = await supabase
    .from('site_settings')
    .select('setting_key, setting_value')
    .in('setting_key', ['service_seniors_image', 'service_business_image']);

  // Traitement des données...
};
```

**Affichage** :

```tsx
<img
  src={serviceSeniorsImage}
  alt="Service Seniors"
  className="w-full h-full object-cover"
/>
```

---

## 🎨 Où les Images Apparaissent

Les images apparaissent sur la page **Services & Livraison** (`/services`) dans la section **"Services Spécialisés"** :

- **Service Seniors** : Carte de gauche avec bordure verte (couleur primaire)
- **Service Entreprises** : Carte de droite avec bordure verte claire (couleur boutons)

Chaque carte comprend :
- L'image en haut (256px de hauteur)
- Le contenu textuel en dessous
- Les informations de contact (téléphone / email)

---

## 🔒 Sécurité et Permissions

- ✅ **Lecture publique** : Les images sont accessibles à tous les visiteurs
- ✅ **Modification admin** : Seuls les administrateurs peuvent modifier les images
- ✅ **RLS activé** : Row Level Security configuré sur la table `site_settings`

---

## 🆘 Dépannage

### L'image ne s'affiche pas

1. **Vérifiez l'URL** :
   - L'URL doit être accessible publiquement
   - Testez l'URL dans un nouvel onglet de navigateur
   - Vérifiez qu'il n'y a pas d'erreur CORS

2. **Vérifiez la base de données** :
   ```sql
   SELECT * FROM site_settings
   WHERE setting_key IN ('service_seniors_image', 'service_business_image');
   ```

3. **Videz le cache** :
   - Rafraîchissez la page avec Ctrl+F5
   - Videz le cache du navigateur

### L'image n'apparaît pas dans l'admin

1. Vérifiez que la table `site_settings` existe
2. Exécutez le script `add_service_images.sql`
3. Rafraîchissez la page d'administration

### Erreur "Image non trouvée"

- Une image de secours s'affiche automatiquement
- Vérifiez que l'URL de l'image est correcte
- Assurez-vous que l'image est toujours hébergée

---

## 📊 Workflow Recommandé

### Pour Changer les Images

1. **Préparez vos images** :
   - Dimensions recommandées : 1200x800 pixels
   - Format : JPG ou PNG
   - Poids : < 500 KB pour de bonnes performances

2. **Hébergez les images** :
   - Sur Unsplash (URLs gratuites)
   - Sur votre propre serveur
   - Sur un service d'hébergement d'images

3. **Configurez dans l'admin** :
   - Copiez l'URL de l'image
   - Collez-la dans le champ approprié
   - Vérifiez l'aperçu
   - Sauvegardez

4. **Testez sur le site** :
   - Visitez la page Services & Livraison
   - Vérifiez que les images s'affichent correctement
   - Testez sur mobile et desktop

---

## 🚀 Fonctionnalités Futures Possibles

- [ ] Upload direct d'images depuis l'admin
- [ ] Galerie d'images prédéfinies
- [ ] Recadrage d'images intégré
- [ ] Optimisation automatique des images
- [ ] Versions responsive automatiques
- [ ] Historique des images utilisées

---

## 📝 Notes Importantes

- Les images sont chargées dynamiquement depuis la base de données
- Les modifications sont instantanées (pas de rechargement nécessaire côté admin)
- Les visiteurs voient les nouvelles images immédiatement
- Les images de secours s'affichent automatiquement en cas d'erreur
- Format responsive : les images s'adaptent automatiquement à la taille de l'écran

---

## 📧 Support

Pour toute question ou problème :
1. Consultez ce document
2. Vérifiez les logs de la console navigateur (F12)
3. Consultez les logs Supabase
