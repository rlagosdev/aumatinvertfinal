# Apparence du Site - Administration

## 📋 Vue d'ensemble

La section **"Apparence"** regroupe la gestion du contenu de toutes les pages publiques du site dans une interface unifiée.

---

## 🎯 Accès

1. Connectez-vous à l'administration
2. Cliquez sur **"Apparence"** dans le menu latéral (icône 📐)
3. Sélectionnez la page à modifier parmi les 4 disponibles

---

## 📄 Pages gérables

### 1. 🏠 **Accueil**
Configuration de la page d'accueil :
- Image de bannière
- Titre principal
- Description
- Textes des boutons d'action
- Liens des boutons

### 2. 🛍️ **Produits**
Configuration de la page produits :
- Titre de la page
- Section "Commandes personnalisées"
  - Titre d'accroche
  - Description
  - 3 services proposés
- Informations du magasin (adresse, livraison)

### 3. 🎉 **Événements**
Configuration de la page événements :
- Titre de la page
- Description principale
- Contenu des événements
- Images et détails

### 4. ℹ️ **À Propos**
Configuration de la page à propos :
- Titre de la page
- Histoire de l'entreprise
- Valeurs et engagements
- Informations de contact

---

## ✨ Fonctionnalités

### Interface unifiée
- **Sélecteur visuel** : Cartes cliquables pour chaque page
- **Indicateur actif** : Point animé sur la page sélectionnée
- **Navigation fluide** : Passage instantané entre les pages

### Gestion du contenu
- **Édition en temps réel** : Modifications instantanées
- **Aperçu visuel** : Prévisualisation avant sauvegarde
- **Boutons d'action** : Réinitialiser / Sauvegarder
- **Support emojis** : Pour un contenu plus attractif

---

## 🎨 Utilisation

### Modifier une page

1. **Sélectionner** : Cliquez sur la carte de la page à modifier
2. **Éditer** : Modifiez les champs de texte
3. **Prévisualiser** : Vérifiez l'aperçu en bas de page
4. **Sauvegarder** : Cliquez sur "Sauvegarder" pour appliquer

### Actions disponibles

| Action | Description |
|--------|-------------|
| 🔄 Réinitialiser | Restaure les valeurs par défaut |
| 💾 Sauvegarder | Enregistre les modifications |

---

## 🗄️ Structure de la base de données

Chaque page a sa propre table de configuration :

```
home_config
├── id (1)
├── banner_image_url
├── main_title
├── main_description
├── button_1_text
├── button_1_link
├── button_2_text
├── button_2_link
└── updated_at

products_page_config
├── id (1)
├── page_title
├── custom_orders_title
├── custom_orders_description
├── custom_order_item_1
├── custom_order_item_2
├── custom_order_item_3
├── store_info_text
└── updated_at

events_config
├── id (1)
├── page_title
├── description
├── event_content
└── updated_at

about_config
├── id (1)
├── page_title
├── our_story
├── our_values
└── updated_at
```

---

## 🔧 Installation

### 1. Créer la table pour la page Produits

Exécutez le script SQL dans Supabase :
```bash
create_products_page_config_table.sql
```

### 2. Vérifier les autres tables

Assurez-vous que ces tables existent :
- ✅ `home_config`
- ✅ `events_config`
- ✅ `about_config`
- ✅ `products_page_config` (nouvellement créée)

---

## 🔒 Sécurité

Toutes les tables ont :
- ✅ **RLS activé** (Row Level Security)
- ✅ **Lecture publique** : Accessible à tous
- ✅ **Modification admin** : Réservée aux administrateurs

---

## 💡 Avantages de cette approche

1. **Interface centralisée** : Toutes les pages au même endroit
2. **Navigation intuitive** : Sélection visuelle des pages
3. **Cohérence** : Même expérience pour toutes les pages
4. **Efficacité** : Moins de clics pour gérer le contenu
5. **Évolutivité** : Facile d'ajouter de nouvelles pages

---

## 🎯 Workflow recommandé

1. **Planifier** : Définissez le contenu avant de modifier
2. **Modifier** : Éditez une page à la fois
3. **Prévisualiser** : Vérifiez l'aperçu
4. **Sauvegarder** : Enregistrez les modifications
5. **Tester** : Vérifiez sur le site public
6. **Itérer** : Ajustez si nécessaire

---

## 🆘 Dépannage

### La page ne se charge pas
1. Vérifiez que toutes les tables existent
2. Vérifiez les policies RLS
3. Consultez la console navigateur

### Les modifications ne s'appliquent pas
1. Vérifiez que vous avez cliqué sur "Sauvegarder"
2. Rafraîchissez la page publique
3. Videz le cache navigateur

### Une table manque
Exécutez les scripts SQL correspondants pour créer les tables manquantes.

---

## 🚀 Prochaines amélioations possibles

- [ ] Prévisualisation en temps réel (iframe)
- [ ] Historique des modifications
- [ ] Publication programmée
- [ ] A/B testing
- [ ] Multi-langue
- [ ] Gestion des médias intégrée

---

## 📊 Menu de navigation

L'apparence est accessible via le menu latéral qui comprend maintenant :

1. Vue d'ensemble
2. Commandes
3. Produits
4. Catégories
5. Codes Promo
6. **Apparence** ⭐ (nouvelle section)
7. Utilisateurs
8. Calendrier
9. Personnalisation
