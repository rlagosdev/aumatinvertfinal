# Gestion de la Page Services & Livraison

## 📋 Vue d'ensemble

La page **Services & Livraison** est maintenant entièrement gérable depuis l'interface d'administration via la section **Apparence**.

Cette page affiche deux services spécialisés :
- 🧓 **Service Seniors** : Livraison gratuite pour les personnes âgées de 65+ ans
- 🏢 **Service Entreprises** : Solutions professionnelles pour événements d'entreprise

---

## 🎯 Accès à la Gestion

### Depuis l'Administration

1. Connectez-vous à l'administration
2. Cliquez sur **"Apparence"** dans le menu latéral (icône 📐)
3. Cliquez sur la carte **"Services"** avec l'icône camion
4. Gérez le contenu et les images des services

---

## 📄 Contenu Gérable

### 1. En-tête de la Page

- **Titre de la page** : `Services & Livraison`
- **Description de la page** : Introduction générale des services

### 2. Service Seniors (65+ ans)

- **Titre du service** : Ex: "Service Seniors"
- **Description** : Texte explicatif du service
- **Image** : Photo illustrant le service (livraison à domicile pour seniors)
- **Label téléphone** : Ex: "Commande par téléphone"

**Avantages inclus** (non éditables, codés en dur) :
- Livraison gratuite (sans minimum)
- Créneaux prioritaires
- Aide au portage
- Conseils nutritionnels
- Commande par téléphone

### 3. Service Entreprises

- **Titre du service** : Ex: "Service Entreprises"
- **Description** : Texte explicatif du service
- **Image** : Photo illustrant le service (camionnette de livraison professionnelle)
- **Label email** : Ex: "Devis personnalisé"

**Avantages inclus** (non éditables, codés en dur) :
- Plateaux pour réunions
- Livraison en entreprise
- Facturation dédiée
- Commandes récurrentes
- Devis personnalisé

---

## 🗄️ Structure de la Base de Données

### Table `services_page_config`

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Toujours 1 (une seule ligne) |
| `page_title` | TEXT | Titre de la page |
| `page_description` | TEXT | Description de la page |
| `seniors_title` | TEXT | Titre du Service Seniors |
| `seniors_description` | TEXT | Description du Service Seniors |
| `seniors_image` | TEXT | URL de l'image Service Seniors |
| `seniors_phone_label` | TEXT | Label pour le téléphone |
| `business_title` | TEXT | Titre du Service Entreprises |
| `business_description` | TEXT | Description du Service Entreprises |
| `business_image` | TEXT | URL de l'image Service Entreprises |
| `business_email_label` | TEXT | Label pour l'email |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

---

## 🔧 Installation

### 1. Créer la Table

Exécutez le script SQL dans Supabase SQL Editor :

```bash
create_services_page_config_table.sql
```

Ce script :
- Crée la table `services_page_config`
- Insère les valeurs par défaut
- Active RLS (Row Level Security)
- Configure les policies (lecture publique, modification admin)

### 2. Vérifier l'Installation

```sql
SELECT * FROM services_page_config;
```

Vous devriez voir une ligne avec toutes les configurations par défaut.

---

## 💡 Comment Modifier le Contenu

### Méthode 1 : Via l'Interface Admin (Recommandé)

1. **Administration → Apparence → Services**
2. Modifiez les champs de texte
3. Changez les URLs des images
4. Prévisualisez les images dans les aperçus
5. Cliquez sur **"Sauvegarder"**

### Méthode 2 : Directement en Base de Données

```sql
-- Modifier le titre du Service Seniors
UPDATE services_page_config
SET seniors_title = 'Nouveau titre'
WHERE id = 1;

-- Modifier l'image du Service Entreprises
UPDATE services_page_config
SET business_image = 'https://nouvelle-url.com/image.jpg'
WHERE id = 1;
```

---

## 📸 Recommandations pour les Images

### Service Seniors
- **Style** : Ambiance chaleureuse et rassurante
- **Contenu** : Livraison attentionnée à une personne âgée
- **Format recommandé** : 1200x800 pixels
- **Exemples** : Jeune personne livrant des courses à domicile, aide au portage

**Image par défaut** :
```
https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80
```

### Service Entreprises
- **Style** : Ambiance dynamique et professionnelle
- **Contenu** : Camionnette de livraison, plateaux pour réunions
- **Format recommandé** : 1200x800 pixels
- **Exemples** : Véhicule de livraison professionnel, préparations d'entreprise

**Image par défaut** :
```
https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80
```

---

## 🎨 Affichage sur le Site

Les services apparaissent sur la page **Services & Livraison** (`/services`) dans la section **"Services Spécialisés"**.

### Design des Cartes

Chaque service est affiché dans une carte avec :
- **Image en haut** : 256px de hauteur, responsive
- **Contenu en dessous** :
  - Titre du service
  - Description
  - Liste des avantages (puces)
  - Contact (téléphone ou email)

### Couleurs

- **Service Seniors** : Bordure verte (couleur primaire `--color-primary`)
- **Service Entreprises** : Bordure verte claire (couleur boutons `--color-buttons`)

---

## 🔒 Sécurité et Permissions

- ✅ **Lecture publique** : Tout le monde peut voir le contenu
- ✅ **Modification admin** : Seuls les administrateurs peuvent modifier
- ✅ **RLS activé** : Row Level Security configuré
- ✅ **Policies** : Lecture publique + Modification admin uniquement

---

## 🆘 Dépannage

### Le contenu ne se charge pas

1. Vérifiez que la table existe :
   ```sql
   SELECT * FROM services_page_config;
   ```

2. Si la table n'existe pas, exécutez le script `create_services_page_config_table.sql`

3. Rafraîchissez la page d'administration

### Les modifications ne s'appliquent pas

1. Vérifiez que vous avez cliqué sur **"Sauvegarder"**
2. Rafraîchissez la page publique avec Ctrl+F5
3. Vérifiez les logs de la console (F12)

### Les images ne s'affichent pas

1. Vérifiez que les URLs sont accessibles publiquement
2. Testez l'URL dans un nouvel onglet
3. Vérifiez les erreurs CORS

---

## 🔄 Workflow Recommandé

### Pour Modifier le Contenu

1. **Planifier** : Définissez le contenu avant de modifier
2. **Préparer les images** :
   - Téléchargez ou trouvez des images appropriées
   - Hébergez-les (Unsplash, votre serveur, etc.)
   - Copiez les URLs
3. **Modifier dans l'admin** :
   - Allez dans Apparence → Services
   - Modifiez les textes
   - Collez les URLs des images
   - Vérifiez les aperçus
4. **Sauvegarder** : Cliquez sur "Sauvegarder"
5. **Tester** : Visitez la page Services & Livraison
6. **Ajuster** : Apportez des modifications si nécessaire

---

## 📊 Organisation de l'Administration

### Apparence vs Paramètres

**Apparence** (contenu des pages) :
- ✅ Page Accueil
- ✅ Page Produits
- ✅ **Page Services** ⭐ (nouveau)
- ✅ Page Événements
- ✅ Page À Propos

**Paramètres** (configuration technique) :
- Logo
- Informations d'entreprise
- Contact
- Tarifs de livraison
- Horaires
- Vacances
- Instagram
- Produits phares
- Couleurs

---

## 🚀 Prochaines Améliorations Possibles

- [ ] Gestion des avantages (liste dynamique)
- [ ] Ajout d'un 3ème service spécialisé
- [ ] Upload direct d'images
- [ ] Multi-langue
- [ ] Statistiques d'utilisation des services
- [ ] Formulaires de contact spécifiques par service

---

## 📝 Notes Importantes

- Le contenu est stocké dans une table dédiée `services_page_config`
- Les modifications sont instantanées
- Les images par défaut sont hébergées sur Unsplash
- Le composant est `ServicesPageManager.tsx`
- Les données de contact (téléphone/email) viennent de `useContactInfo` hook
- Format responsive : s'adapte automatiquement à tous les écrans

---

## 📧 Support

Pour toute question :
1. Consultez ce document
2. Vérifiez la console navigateur (F12)
3. Consultez les logs Supabase
4. Vérifiez le fichier `ServicesPageManager.tsx`
