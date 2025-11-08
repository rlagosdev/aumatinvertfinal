# 📋 Guide Administrateur - Système de Promotions

## 🎯 Vue d'ensemble

Le système de promotions permet d'afficher des prix réduits sur les produits avec un affichage automatique du prix barré et du pourcentage de réduction. **Tout se gère depuis l'interface d'administration**, sans besoin de SQL.

---

## ✅ Comment créer une promotion

### 1. Accéder à l'édition du produit
- Connectez-vous à l'admin : `https://localhost:5178/admin`
- Allez dans "Gestion des produits"
- Cliquez sur "Modifier" sur le produit souhaité

### 2. Activer la promotion
- Cochez la case **"Activer la promotion (prix barré)"**
- Un panneau rouge apparaît avec les options de promotion

### 3. Configurer le prix promotionnel
- Entrez le **prix promotionnel** (doit être inférieur au prix normal)
- Exemple : Prix normal 9,90€ → Prix promo 5,00€
- Le système calcule automatiquement le pourcentage de réduction

### 4. Configurer les dates (OPTIONNEL)

#### Option A : Promotion permanente (sans dates)
- **Ne remplissez aucune date**
- La promotion sera active immédiatement et indéfiniment
- ✅ Idéal pour : Produits en liquidation, promotions permanentes

#### Option B : Promotion planifiée (avec dates)
- **Date de début** : Jour où la promotion démarre
  - Exemple : 07/11/2025 pour aujourd'hui
  - Si vous mettez une date future, la promotion ne sera visible qu'à partir de cette date
- **Date de fin** : Jour où la promotion se termine automatiquement
  - Exemple : 13/11/2025 pour une semaine
  - La promotion disparaîtra automatiquement après cette date
- ✅ Idéal pour : Soldes, événements spéciaux, promotions limitées

### 5. Sauvegarder
- Cliquez sur **"Enregistrer les modifications"**
- Un message de succès apparaît
- Les modifications sont immédiates dans la base de données

### 6. Vérifier l'affichage côté client
- Allez sur la page produits : `https://localhost:5178/produits`
- **Rafraîchissez la page** (F5 ou Ctrl+R)
- La promotion doit apparaître avec :
  - Badge rouge avec le pourcentage de réduction (ex: -49%)
  - Prix normal barré (ex: ~~9,90€~~)
  - Prix promotionnel en gros et en rouge (ex: **5,00€**)
  - Montant d'économie (ex: "Économie: 4,90€")

---

## 🔍 Comment fonctionne l'affichage automatique ?

Le système vérifie automatiquement plusieurs conditions avant d'afficher une promotion :

1. ✅ La case "Activer la promotion" est cochée
2. ✅ Un prix promotionnel est défini
3. ✅ Le prix promotionnel est inférieur au prix normal
4. ✅ **Vérification des dates :**
   - Pas de dates → Promotion active immédiatement ✅
   - Date de début future → Promotion pas encore visible ⏳
   - Date de début passée et pas de fin → Promotion active ✅
   - Date de début passée et date de fin future → Promotion active ✅
   - Date de fin passée → Promotion expirée ❌

**Important :** Si une promotion n'apparaît pas côté client, vérifiez que la date de début n'est pas dans le futur !

---

## 📅 Exemples de configurations

### Exemple 1 : Promotion immédiate et permanente
```
✅ Activer la promotion : Coché
Prix normal : 10,00€
Prix promotionnel : 7,50€
Date de début : (vide)
Date de fin : (vide)

→ Résultat : -25% visible immédiatement et pour toujours
```

### Exemple 2 : Soldes d'hiver (du 15/01 au 31/01)
```
✅ Activer la promotion : Coché
Prix normal : 20,00€
Prix promotionnel : 15,00€
Date de début : 15/01/2025
Date de fin : 31/01/2025

→ Résultat : -25% visible uniquement entre ces dates
```

### Exemple 3 : Lancement de produit (à partir d'aujourd'hui)
```
✅ Activer la promotion : Coché
Prix normal : 12,00€
Prix promotionnel : 9,99€
Date de début : 07/11/2025 (aujourd'hui)
Date de fin : (vide)

→ Résultat : -17% visible à partir d'aujourd'hui sans limite
```

### Exemple 4 : Promotion future (Black Friday)
```
✅ Activer la promotion : Coché
Prix normal : 50,00€
Prix promotionnel : 29,99€
Date de début : 29/11/2025
Date de fin : 02/12/2025

→ Résultat : -40% visible uniquement pendant le Black Friday
```

---

## 🛠️ Dépannage

### ❌ La promotion ne s'affiche pas côté client

**Causes possibles :**

1. **Date de début dans le futur**
   - Solution : Modifiez la date de début à aujourd'hui ou laissez vide
   - Exemple : Si aujourd'hui = 07/11 et début = 09/11 → Pas visible avant le 09/11

2. **Page pas rafraîchie**
   - Solution : Appuyez sur F5 ou Ctrl+R pour recharger la page
   - Le cache du navigateur peut afficher l'ancienne version

3. **Prix promotionnel manquant**
   - Solution : Vérifiez qu'un prix promotionnel est bien entré

4. **Prix promotionnel supérieur au prix normal**
   - Solution : Le prix promo doit être inférieur au prix normal

5. **Case "Activer la promotion" décochée**
   - Solution : Vérifiez que la case est bien cochée

### 📊 Vérifier dans la base de données (si nécessaire)

Exécutez ce script SQL dans Supabase SQL Editor :

```sql
SELECT
  nom,
  prix || ' €' as prix_normal,
  prix_promotionnel || ' €' as prix_promo,
  promotion_active,
  promotion_date_debut,
  promotion_date_fin,
  CURRENT_DATE as aujourdhui,
  CASE
    WHEN promotion_active
      AND prix_promotionnel IS NOT NULL
      AND (promotion_date_debut IS NULL OR promotion_date_debut::date <= CURRENT_DATE)
      AND (promotion_date_fin IS NULL OR promotion_date_fin::date >= CURRENT_DATE)
    THEN '✅ VISIBLE'
    ELSE '❌ NON VISIBLE'
  END as statut
FROM products
WHERE nom = 'Nom de votre produit';
```

### 🔧 Correction rapide pour les dates

Si vous avez configuré une date future par erreur et voulez activer la promotion immédiatement :

**Méthode 1 : Via l'admin (recommandé)**
1. Retournez dans l'édition du produit
2. Modifiez la date de début à aujourd'hui ou supprimez-la
3. Sauvegardez
4. Rafraîchissez la page produits

**Méthode 2 : Via SQL (rapide)**
```sql
UPDATE products
SET promotion_date_debut = CURRENT_DATE
WHERE nom = 'Nom de votre produit';
```

---

## 📦 Où les promotions sont affichées ?

Les promotions apparaissent automatiquement sur :

1. **Page d'accueil** (`/`) - Produits phares
2. **Page produits** (`/produits`) - Liste complète
3. **Pages catégories** (`/categorie/Confitures`) - Produits filtrés
4. **Panier** (`/cart`) - Calcul des totaux avec promotions
5. **Détails produit** - Si une page détail existe

**Important :** Toutes ces pages utilisent le même système de détection des promotions (`usePromotionalPricing`), donc le comportement est cohérent partout.

---

## 🎨 Affichage visuel des promotions

### Sur les cartes produits :
```
┌─────────────────────────┐
│  [IMAGE PRODUIT]        │
│  📍 -49%                │ ← Badge rouge en haut à droite
│                         │
│  Abricots Royal         │
│  ~~9,90€~~   5,00€     │ ← Prix barré + Prix promo
│  Économie: 4,90€        │ ← Montant économisé
└─────────────────────────┘
```

### Dans le panier :
- Prix unitaire promotionnel appliqué
- Économie totale calculée automatiquement
- Total panier avec et sans promotions

---

## 🔐 Permissions et sécurité

- **Row Level Security (RLS)** : Activé sur la table `products`
- **Accès admin** : Requis pour modifier les promotions
- **Modifications** : Toutes les modifications sont horodatées (`updated_at`)
- **Retry automatique** : Le système réessaie 3 fois en cas d'erreur réseau

---

## 📝 Bonnes pratiques

### ✅ À faire :
- Configurer les dates de début ET de fin pour les promotions temporaires
- Tester l'affichage côté client après chaque modification
- Utiliser des réductions attractives (minimum -10%)
- Vérifier que le prix promo couvre au moins les coûts
- Rafraîchir la page après modification

### ❌ À éviter :
- Mettre une date de début dans le futur sans le vouloir
- Oublier de cocher "Activer la promotion"
- Prix promotionnel = 0 ou supérieur au prix normal
- Trop de promotions en même temps (dilue l'impact)
- Ne pas vérifier l'affichage côté client

---

## 🚀 Workflow recommandé

1. **Planification**
   - Décidez des produits en promotion
   - Déterminez les dates et les prix
   - Calculez la rentabilité

2. **Configuration**
   - Allez dans l'admin
   - Activez les promotions une par une
   - Vérifiez l'aperçu dans le formulaire

3. **Vérification**
   - Allez sur le site client
   - Rafraîchissez les pages
   - Vérifiez l'affichage correct

4. **Suivi**
   - Utilisez le script SQL de test pour voir toutes les promotions actives
   - Désactivez les promotions expirées ou modifiez les dates

---

## 📞 Support

Si vous rencontrez des problèmes :

1. **Consultez ce guide** pour les solutions courantes
2. **Vérifiez les logs** dans la console du navigateur (F12)
3. **Utilisez le script SQL de test** pour diagnostiquer les problèmes de dates
4. **Contactez le support technique** avec :
   - Nom du produit concerné
   - Configuration de la promotion (prix, dates)
   - Captures d'écran si possible

---

## 🔄 Mise à jour automatique

Le système est conçu pour gérer automatiquement :
- ✅ Activation des promotions à la date de début
- ✅ Désactivation des promotions à la date de fin
- ✅ Calcul des pourcentages de réduction
- ✅ Affichage cohérent sur toutes les pages
- ✅ Retry en cas d'erreur réseau

**Aucune intervention manuelle n'est nécessaire** pour qu'une promotion démarre ou se termine aux dates configurées !

---

## 📚 Ressources supplémentaires

- **Script de test complet** : `test-promotions.sql`
- **Script de correction des dates** : `update-promotion-date.sql`
- **Hook de tarification** : `src/hooks/usePromotionalPricing.ts`
- **Formulaire admin** : `src/components/admin/ProductForm.tsx`

---

**Dernière mise à jour :** 2025-11-07
**Version du système :** 2.0
