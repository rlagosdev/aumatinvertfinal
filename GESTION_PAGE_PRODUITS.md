# Gestion de la Page Produits - Admin

## 📋 Vue d'ensemble

Cette nouvelle section permet de personnaliser tous les textes et messages de la page "Nos Produits" sans modifier le code.

---

## 🔧 Installation

### 1. Créer la table dans Supabase

Exécutez le script SQL `create_products_page_config_table.sql` dans l'éditeur SQL de Supabase :

```sql
-- Le script créera automatiquement :
- La table products_page_config
- La configuration par défaut
- Les policies RLS (sécurité)
```

### 2. Accéder à la section

1. Connectez-vous à l'administration
2. Cliquez sur **"Page Produits"** dans le menu latéral (icône 🛍️)

---

## ✨ Fonctionnalités

### Sections personnalisables :

#### 1. **En-tête de la page**
- **Titre principal** : Le titre H1 de la page (ex: "Nos Produits")

#### 2. **Section Commandes Personnalisées**
- **Titre de la section** : Question d'accroche (ex: "Besoin d'une idée cadeau ?")
- **Description** : Texte introductif (ex: "Nous préparons sur commande :")
- **3 items de services** : Liste des services proposés
  - Corbeilles de fruits frais
  - Plateaux apéritifs ou fromagers
  - Assortiments sur mesure

#### 3. **Informations du magasin**
- **Texte en bas de page** : Adresse et zone de livraison
- Supporte les emojis (📍, 🚚, etc.)

---

## 🎨 Utilisation

### Modifier le contenu

1. **Éditer les champs** : Modifiez directement les textes dans les champs de saisie

2. **Aperçu en direct** : Une prévisualisation s'affiche en bas pour voir le rendu final

3. **Sauvegarder** : Cliquez sur "Sauvegarder" pour appliquer les modifications

4. **Réinitialiser** : Le bouton "Réinitialiser" restaure les valeurs par défaut (sans sauvegarder)

### Actions disponibles

| Bouton | Action |
|--------|--------|
| 🔄 Réinitialiser | Restaure les valeurs par défaut |
| 💾 Sauvegarder | Enregistre les modifications |

---

## 📱 Exemple de configuration

### Configuration par défaut :

```
Titre : Nos Produits

Section commandes :
Titre : Besoin d'une idée cadeau ou d'un buffet gourmand ?
Description : Nous préparons sur commande :
- Corbeilles de fruits frais
- Plateaux apéritifs ou fromagers
- Assortiments sur mesure selon vos envies

Info magasin :
📍 Retrait en magasin : 1 rue du Nil, 44800 Saint-Herblain
🚚 Livraison possible dans un rayon de 3km
```

---

## 🔒 Sécurité

- ✅ **Lecture publique** : Tout le monde peut lire la configuration
- ✅ **Modification admin uniquement** : Seuls les administrateurs peuvent modifier
- ✅ **RLS activé** : Row Level Security pour protéger les données

---

## 💡 Conseils

1. **Utilisez des emojis** pour rendre le texte plus visuel et attractif
2. **Restez concis** : Des textes courts sont plus percutants
3. **Vérifiez l'aperçu** avant de sauvegarder
4. **Testez sur mobile** : Vérifiez que le texte s'affiche bien sur petit écran

---

## 🆘 Dépannage

### La configuration ne se charge pas
1. Vérifiez que la table existe dans Supabase
2. Vérifiez les policies RLS
3. Consultez la console du navigateur pour les erreurs

### Les modifications ne s'appliquent pas
1. Vérifiez que vous avez cliqué sur "Sauvegarder"
2. Rafraîchissez la page produits
3. Videz le cache du navigateur

---

## 🎯 Prochaines étapes possibles

- [ ] Ajouter la possibilité d'uploader des images
- [ ] Personnaliser les couleurs de la section
- [ ] Ajouter plus d'items dans la liste (dynamique)
- [ ] Prévisualisation en temps réel sur la vraie page

---

## 📊 Structure de la base de données

```sql
products_page_config
├── id (1 seule ligne)
├── page_title
├── custom_orders_title
├── custom_orders_description
├── custom_order_item_1
├── custom_order_item_2
├── custom_order_item_3
├── store_info_text
├── created_at
└── updated_at
```
