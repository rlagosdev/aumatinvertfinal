# Gestion des Avis Google (Système Manuel)

## 📋 Vue d'ensemble

Le système **Avis Google** permet d'afficher vos avis clients Google directement sur la page d'accueil du site. Les avis sont gérés manuellement depuis l'interface d'administration (pas besoin d'API Google). Ce système est entièrement gérable depuis la section **Paramètres → Avis Google**.

## 🎯 Accès à la Gestion

### Depuis l'Administration

1. Connectez-vous à l'administration
2. Cliquez sur **"Paramètres"** dans le menu latéral (icône ⚙️)
3. Cliquez sur la carte **"Avis Google"** avec l'icône étoile
4. Deux onglets disponibles :
   - **Gestion des Avis** : Ajouter, modifier, supprimer les avis
   - **Configuration** : Configurer le lien Google et les paramètres d'affichage

---

## 📄 Contenu Gérable

### 1. Gestion des Avis (Onglet Principal)

Depuis l'onglet **"Gestion des Avis"**, vous pouvez :

#### Ajouter un avis
- **Nom de l'auteur** : Ex: "Marie Dupont" (obligatoire)
- **URL de la photo** : Photo de profil (optionnel, une initiale sera affichée si vide)
- **Note** : De 1 à 5 étoiles (cliquez sur les étoiles)
- **Date de l'avis** : Date de publication
- **Texte de l'avis** : Le contenu de l'avis (obligatoire)
- **Ordre d'affichage** : Plus le nombre est élevé, plus l'avis apparaît en premier
- **Avis actif** : Toggle pour activer/désactiver l'avis

#### Modifier un avis
- Cliquez sur **"Modifier"** sur l'avis souhaité
- Modifiez les champs
- Cliquez sur **"Mettre à jour"**

#### Supprimer un avis
- Cliquez sur **"Supprimer"** sur l'avis souhaité
- Confirmez la suppression

#### Réorganiser les avis
- Utilisez les flèches ⬆️ ⬇️ pour monter/descendre un avis
- Le numéro d'ordre est affiché à côté des flèches

#### Activer/Désactiver un avis
- Cliquez sur le badge **"Actif"** ou **"Inactif"**
- Les avis inactifs ne sont pas affichés sur le site

### 2. Configuration (Onglet Configuration)

- **Nom de l'entreprise** : Ex: "Au Matin Vert"
- **Lien Direct vers les avis** : URL complète de votre page Google (recommandé)
- **Google Place ID** : Identifiant unique (optionnel, pour méthode avancée)
- **Affichage sur la page d'accueil** : Toggle pour activer/désactiver le widget complet

### Affichage sur le Site

Le widget apparaît sur la **page d'accueil** (`/`) entre les produits phares et la section Instagram.

Le widget affiche :
- Logo Google
- Note moyenne calculée automatiquement
- Nombre total d'avis
- 5 étoiles dorées
- Grid de cartes avec les avis actifs (jusqu'à 6 avis)
- Chaque carte contient :
  - Photo de profil ou initiale
  - Nom de l'auteur
  - Date de l'avis
  - Note en étoiles
  - Texte de l'avis avec icône citation
- Bouton "Voir tous les avis sur Google" (lien vers votre page Google)
- 3 badges de confiance (100% Avis Vérifiés, Excellent Service, Produits Locaux)

---

## 🗄️ Structure de la Base de Données

### Table `google_reviews` (Avis individuels)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | ID unique de l'avis |
| `author_name` | TEXT | Nom de l'auteur (obligatoire) |
| `author_photo_url` | TEXT | URL de la photo (optionnel) |
| `rating` | INTEGER | Note de 1 à 5 (obligatoire) |
| `review_text` | TEXT | Texte de l'avis (obligatoire) |
| `review_date` | DATE | Date de l'avis (obligatoire) |
| `is_active` | BOOLEAN | Avis actif/inactif (true/false) |
| `display_order` | INTEGER | Ordre d'affichage (plus élevé = en premier) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

### Table `google_reviews_config` (Configuration)

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | INTEGER | Toujours 1 (une seule ligne) |
| `place_id` | TEXT | Google Place ID de l'entreprise |
| `business_name` | TEXT | Nom de l'entreprise |
| `direct_link` | TEXT | Lien direct vers les avis Google |
| `show_on_homepage` | BOOLEAN | Afficher sur la page d'accueil (true/false) |
| `created_at` | TIMESTAMPTZ | Date de création |
| `updated_at` | TIMESTAMPTZ | Date de mise à jour |

---

## 🔧 Installation

### 1. Créer les Tables

Exécutez les deux scripts SQL dans Supabase SQL Editor :

#### Script 1 : Configuration
```bash
create_google_reviews_config_table.sql
```

Ce script :
- Crée la table `google_reviews_config`
- Insère les valeurs par défaut
- Active RLS (Row Level Security)
- Configure les policies (lecture publique, modification admin)

#### Script 2 : Avis individuels
```bash
create_google_reviews_table.sql
```

Ce script :
- Crée la table `google_reviews`
- Crée un index pour les requêtes optimisées
- Active RLS (Row Level Security)
- Configure les policies (lecture publique des avis actifs, modification admin)
- Insère 3 avis exemples que vous pouvez modifier

### 2. Vérifier l'Installation

```sql
-- Vérifier la configuration
SELECT * FROM google_reviews_config;

-- Vérifier les avis
SELECT * FROM google_reviews ORDER BY display_order DESC, review_date DESC;
```

Vous devriez voir :
- 1 ligne de configuration par défaut
- 3 avis exemples

---

## 💡 Comment Ajouter vos Vrais Avis Google

### Méthode Recommandée : Copie Manuelle

1. **Trouvez votre page Google Business** :
   - Recherchez "Au Matin Vert" sur Google
   - Cliquez sur vos avis

2. **Pour chaque avis à ajouter** :
   - Notez le nom de l'auteur
   - Copiez la photo de profil (clic droit → Copier l'adresse de l'image) - optionnel
   - Notez le nombre d'étoiles (1-5)
   - Copiez le texte de l'avis
   - Notez la date de publication

3. **Ajoutez l'avis dans l'admin** :
   - Allez dans **Paramètres → Avis Google → Gestion des Avis**
   - Cliquez sur **"Ajouter un avis"**
   - Remplissez tous les champs
   - Activez "Avis actif"
   - Définissez l'ordre d'affichage (les meilleurs avis avec un ordre plus élevé)
   - Cliquez sur **"Ajouter"**

4. **Répétez** pour tous les avis que vous souhaitez afficher

### Configuration du Lien Google

#### Option 1 : Lien Direct (Plus Simple)

1. Recherchez votre entreprise sur Google
2. Cliquez sur vos avis ou votre note d'étoiles
3. Copiez l'URL complète dans la barre d'adresse
4. Allez dans **Paramètres → Avis Google → Configuration**
5. Collez l'URL dans "Lien Direct vers vos Avis"
6. Sauvegardez

#### Option 2 : Google Place ID (Avancé)

1. Allez sur [Google Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id)
2. Recherchez votre entreprise "Au Matin Vert"
3. Copiez le "Place ID" qui commence par "ChIJ..."
4. Collez-le dans l'admin

**Note** : Si vous avez les deux (lien direct + Place ID), le lien direct sera utilisé en priorité.

---

## 🎨 Modifier le Contenu

### Via l'Interface Admin (Recommandé)

#### Gestion des Avis

1. **Administration → Paramètres → Avis Google → Gestion des Avis**
2. **Pour ajouter** : Cliquez sur "Ajouter un avis" et remplissez le formulaire
3. **Pour modifier** : Cliquez sur "Modifier" sur l'avis souhaité
4. **Pour supprimer** : Cliquez sur "Supprimer" et confirmez
5. **Pour réorganiser** : Utilisez les flèches ⬆️ ⬇️
6. **Pour activer/désactiver** : Cliquez sur le badge "Actif"/"Inactif"

#### Configuration

1. **Administration → Paramètres → Avis Google → Configuration**
2. Entrez le nom de votre entreprise
3. Collez votre lien direct ou votre Google Place ID
4. Activez/désactivez l'affichage avec le toggle
5. Cliquez sur **"Sauvegarder"**

### Directement en Base de Données

```sql
-- Ajouter un avis manuellement
INSERT INTO google_reviews (author_name, rating, review_text, review_date, is_active, display_order)
VALUES ('Jean Dupont', 5, 'Excellent service !', '2024-03-01', true, 10);

-- Modifier un avis
UPDATE google_reviews
SET review_text = 'Nouveau texte', rating = 4
WHERE id = 'uuid-de-l-avis';

-- Désactiver un avis
UPDATE google_reviews
SET is_active = false
WHERE id = 'uuid-de-l-avis';

-- Modifier la configuration
UPDATE google_reviews_config
SET direct_link = 'https://...'
WHERE id = 1;
```

---

## 📊 Design du Widget

### Couleurs et Style

- **Fond section** : Dégradé vert (from-green-50 to-cyan-50)
- **Cartes d'avis** : Fond blanc avec bordure légère et ombre
- **Étoiles** : Jaune (fill-yellow-400 text-yellow-400)
- **Bouton CTA** : Couleur primaire du site (bg-site-primary)
- **Photos/Initiales** : Dégradé du thème (from-site-primary to-site-buttons)

### Badges de Confiance

Trois badges s'affichent sous le widget principal :
1. **100%** Avis Vérifiés
2. **⭐** Excellent Service
3. **Local** Produits Frais

### Layout

- **Grid responsive** : 1 colonne sur mobile, 2 sur tablette, 3 sur desktop
- **Limite d'affichage** : Maximum 6 avis sur la page d'accueil
- **Tri automatique** : Par ordre d'affichage décroissant, puis par date
- **Note moyenne** : Calculée automatiquement à partir des avis actifs

---

## 🔒 Sécurité et Permissions

### Table `google_reviews`
- ✅ **Lecture publique** : Tout le monde peut voir les avis actifs uniquement
- ✅ **Lecture admin** : Les admins peuvent voir tous les avis (actifs + inactifs)
- ✅ **Modification admin** : Seuls les administrateurs peuvent ajouter/modifier/supprimer
- ✅ **RLS activé** : Row Level Security configuré
- ✅ **Index optimisé** : Pour des requêtes rapides

### Table `google_reviews_config`
- ✅ **Lecture publique** : Tout le monde peut voir la configuration
- ✅ **Modification admin** : Seuls les administrateurs peuvent modifier
- ✅ **RLS activé** : Row Level Security configuré

---

## 🆘 Dépannage

### Le widget ne s'affiche pas sur la page d'accueil

1. **Vérifiez que les tables existent** :
   ```sql
   SELECT * FROM google_reviews_config;
   SELECT * FROM google_reviews;
   ```

2. **Vérifiez que `show_on_homepage` est activé** :
   ```sql
   UPDATE google_reviews_config SET show_on_homepage = true WHERE id = 1;
   ```

3. **Vérifiez qu'il y a des avis actifs** :
   ```sql
   SELECT * FROM google_reviews WHERE is_active = true;
   ```
   Le widget ne s'affiche que s'il y a au moins 1 avis actif !

4. Rafraîchissez la page avec Ctrl+F5

### Aucun avis ne s'affiche

1. **Vérifiez qu'il y a des avis actifs** :
   ```sql
   SELECT * FROM google_reviews WHERE is_active = true;
   ```

2. Si aucun avis actif, activez-en au moins un :
   - Depuis l'admin : Cliquez sur "Inactif" → "Actif"
   - Ou en SQL : `UPDATE google_reviews SET is_active = true WHERE id = 'uuid';`

3. Rafraîchissez la page

### Le lien "Voir tous les avis" ne fonctionne pas

1. **Vérifiez la configuration** :
   - Allez dans Paramètres → Avis Google → Configuration
   - Vérifiez que vous avez soit un "Lien Direct" soit un "Place ID"

2. **Testez le lien** :
   - Cliquez sur "Tester le lien" dans l'aperçu de configuration
   - Si ça ne marche pas, recopiez l'URL depuis Google

### Les modifications ne s'appliquent pas

1. Vérifiez que vous avez cliqué sur **"Sauvegarder"** ou **"Ajouter"**
2. Vérifiez qu'il n'y a pas d'erreur dans la console (F12)
3. Rafraîchissez la page d'accueil avec Ctrl+F5

### Les avis ne sont pas dans le bon ordre

1. Utilisez les flèches ⬆️ ⬇️ dans l'admin pour réorganiser
2. Ou modifiez le champ "Ordre d'affichage" (plus élevé = en premier)
3. Rafraîchissez la page

---

## 🔄 Workflow Recommandé

### Configuration Initiale (À faire une seule fois)

1. **Exécuter les scripts SQL** :
   - Ouvrez Supabase SQL Editor
   - Exécutez `create_google_reviews_config_table.sql`
   - Exécutez `create_google_reviews_table.sql`
   - Vérifiez que les tables sont créées

2. **Configurer le lien Google** :
   - Allez dans **Paramètres → Avis Google → Configuration**
   - Entrez le nom de votre entreprise
   - Collez votre lien direct Google (ou Place ID)
   - Activez "Afficher sur la page d'accueil"
   - Sauvegardez

### Ajouter vos Avis (Routine)

1. **Accédez à vos avis Google** :
   - Recherchez votre entreprise sur Google
   - Cliquez sur vos avis

2. **Pour chaque avis que vous voulez ajouter** :
   - Allez dans **Paramètres → Avis Google → Gestion des Avis**
   - Cliquez sur **"Ajouter un avis"**
   - Remplissez le formulaire :
     - Nom de l'auteur (obligatoire)
     - Note en étoiles (cliquez sur les étoiles)
     - Date de l'avis
     - Texte de l'avis (copiez-collez depuis Google)
     - Photo de profil (optionnel)
     - Ordre d'affichage (les meilleurs avis avec un nombre plus élevé)
   - Activez "Avis actif"
   - Cliquez sur **"Ajouter"**

3. **Vérifiez sur le site** :
   - Visitez la page d'accueil
   - Les avis doivent s'afficher
   - Vérifiez que le bouton "Voir tous les avis" fonctionne

4. **Ajustez si nécessaire** :
   - Réorganisez avec les flèches ⬆️ ⬇️
   - Désactivez les avis moins pertinents
   - Modifiez les textes si besoin

---

## 🚀 Améliorations Futures Possibles

- [x] Affichage du nombre d'avis (✅ Implémenté)
- [x] Affichage de la note moyenne (✅ Implémenté - calculée automatiquement)
- [x] Affichage des avis avec photos et détails (✅ Implémenté)
- [x] Gestion complète CRUD des avis (✅ Implémenté)
- [x] Système de réorganisation (✅ Implémenté)
- [ ] Import automatique via Google Places API (nécessite API key)
- [ ] Widget personnalisable (couleurs, taille)
- [ ] Multi-emplacements (plusieurs fiches Google)
- [ ] Pagination des avis (si plus de 6 avis)
- [ ] Filtrage par note (afficher seulement 5 étoiles, etc.)
- [ ] Statistiques détaillées (répartition des notes)

---

## 📝 Notes Importantes

### Système Manuel (Pas d'API Google requise)
- ✅ **Aucune API key nécessaire** - Tout est géré manuellement
- ✅ **Aucun coût** - Pas de frais Google Cloud
- ✅ **Contrôle total** - Vous choisissez quels avis afficher
- ✅ **Pas de limite** - Ajoutez autant d'avis que vous voulez
- ✅ **Sécurisé** - RLS activé pour toutes les tables

### Composants
- `GoogleReviewsDisplay.tsx` : Affichage des avis sur la page d'accueil
- `GoogleReviewsList.tsx` : Interface de gestion CRUD des avis
- `GoogleReviewsManager.tsx` : Manager admin avec onglets
- `GoogleReviews.tsx` : Ancien widget simple (remplacé)

### Comportement
- Le widget s'affiche uniquement si :
  - `show_on_homepage` est à `true` dans la config
  - Il y a au moins 1 avis actif dans la table
- Maximum 6 avis affichés sur la page d'accueil
- Tri automatique par ordre d'affichage décroissant, puis par date
- Note moyenne calculée automatiquement
- Responsive : 1/2/3 colonnes selon la taille d'écran

---

## 📧 Support

Pour toute question :
1. Consultez ce document
2. Vérifiez la console navigateur (F12)
3. Consultez les logs Supabase
4. Vérifiez le fichier `GoogleReviews.tsx` et `GoogleReviewsManager.tsx`

---

## 📚 Fichiers Concernés

### Composants Frontend
- `src/components/GoogleReviewsDisplay.tsx` - Widget d'affichage des avis sur la page d'accueil
- `src/components/admin/GoogleReviewsList.tsx` - Interface CRUD de gestion des avis
- `src/components/admin/GoogleReviewsManager.tsx` - Manager avec onglets (Avis + Config)
- `src/pages/Home.tsx` - Page d'accueil (intégration du widget)

### Scripts SQL
- `create_google_reviews_config_table.sql` - Création de la table de configuration
- `create_google_reviews_table.sql` - Création de la table des avis individuels

### Documentation
- `GESTION_AVIS_GOOGLE.md` - Ce document (guide complet)
