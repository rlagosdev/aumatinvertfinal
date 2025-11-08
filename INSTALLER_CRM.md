# 📋 Installation du CRM - Gestion des Contacts

## ✅ Étapes à suivre

### 1. Exécuter le script SQL dans Supabase

1. **Connectez-vous à votre projet Supabase** : https://supabase.com/dashboard
2. Allez dans **SQL Editor** (menu de gauche)
3. Cliquez sur **New Query**
4. Copiez-collez le contenu du fichier `supabase/migrations/create_crm_contacts.sql`
5. Cliquez sur **Run** pour exécuter le script

Le script va créer :
- ✅ La table `crm_contacts` avec tous les champs nécessaires
- ✅ Les index pour optimiser les performances
- ✅ Un trigger automatique pour synchroniser les contacts depuis les commandes
- ✅ Les politiques de sécurité RLS (Row Level Security)

### 2. Vérifier que tout fonctionne

Une fois le script exécuté :

1. **Accédez à l'admin** : `https://localhost:5178/admin`
2. Cliquez sur **CRM - Contacts**
3. Vous devriez voir :
   - Le bouton **"Ajouter un contact"** en haut à droite
   - Un tableau vide (normal si vous n'avez pas encore de contacts)

### 3. Test manuel - Ajouter un contact

1. Cliquez sur **"Ajouter un contact"**
2. Remplissez le formulaire :
   - **Email** (obligatoire)
   - Prénom, Nom, Téléphone (optionnels)
   - Adresse, Code postal, Ville (optionnels)
   - **Type** : Prospect ou Client
   - Notes (optionnelles)
3. Cliquez sur **"Créer le contact"**
4. Le contact devrait apparaître dans le tableau

### 4. Test automatique - Synchronisation depuis les commandes

À chaque fois qu'une commande est créée sur le site :
- ✅ Le client est **automatiquement ajouté** dans le CRM
- ✅ Ses informations sont **mises à jour** (nombre de commandes, total achats)
- ✅ Son statut passe de "Prospect" à "Client"

## 📊 Fonctionnalités du CRM

### 📈 Statistiques
- Total des contacts
- Nombre de clients vs prospects
- Nombre total de commandes
- Chiffre d'affaires total
- Panier moyen

### 🔍 Filtres et recherche
- Recherche par nom, email, téléphone
- Filtrage par type (Tous / Clients / Prospects)
- Tri par nom, date, commandes ou montant
- Ordre croissant ou décroissant

### ⚡ Actions disponibles
- ✏️ **Modifier** un contact
- 🗑️ **Supprimer** un contact
- ➕ **Ajouter** un contact manuellement

## 🔄 Synchronisation automatique

Le système synchronise automatiquement :
- Les contacts depuis les commandes
- Le nombre de commandes par contact
- Le total des achats
- La date de dernière commande
- Le changement de statut (prospect → client)

## 🔒 Sécurité

- Les contacts sont protégés par RLS (Row Level Security)
- Seuls les administrateurs peuvent voir et modifier les contacts
- Chaque contact a un email unique (pas de doublons)

## ⚠️ Important

- Le champ **email** est obligatoire et unique
- Les statistiques (nombre de commandes, total achats) sont **automatiquement calculées** par le trigger
- Ne modifiez PAS manuellement les champs `nombre_commandes` et `total_achats` - ils sont gérés automatiquement

## 🛟 Dépannage

### "Aucun contact trouvé"
➡️ Normal si vous venez d'installer le CRM. Ajoutez un contact manuellement ou créez une commande test.

### "Un contact avec cet email existe déjà"
➡️ Vérifiez que l'email n'est pas déjà dans la base. Recherchez-le avec le champ de recherche.

### Les statistiques ne se mettent pas à jour
➡️ Vérifiez que le trigger `trigger_sync_contact_on_order` est bien créé dans Supabase.

---

**Créé le 8 novembre 2025**
**Pour : Au Matin Vert**
