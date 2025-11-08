# Guide d'Installation Roundcube sur Hostinger

Ce guide vous accompagne dans l'installation de Roundcube Webmail sur votre serveur Hostinger pour l'intégrer directement dans votre interface d'administration.

## Pourquoi Roundcube ?

- ✅ **Gratuit et open-source**
- ✅ **Permet l'intégration iframe** (pas de restriction X-Frame-Options)
- ✅ **Interface moderne et responsive**
- ✅ **Facile à installer sur Hostinger**
- ✅ **Compatible avec votre email actuel**

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un compte Hostinger avec accès cPanel
- Un domaine ou sous-domaine (ex: `mail.votredomaine.com`)
- Vos identifiants email existants

---

## Étape 1 : Créer un sous-domaine pour Roundcube

1. **Connectez-vous à votre cPanel Hostinger**
   - URL : `https://hpanel.hostinger.com`

2. **Allez dans "Domaines" → "Sous-domaines"**

3. **Créez un nouveau sous-domaine**
   - Nom : `mail` (ou `webmail`)
   - Domaine : votre domaine principal
   - Résultat : `mail.votredomaine.com`

4. **Notez le chemin du dossier**
   - Exemple : `/home/username/public_html/mail`

---

## Étape 2 : Télécharger Roundcube

### Option A : Via le gestionnaire de fichiers cPanel (Recommandé)

1. **Ouvrez le Gestionnaire de fichiers** dans cPanel

2. **Naviguez vers le dossier de votre sous-domaine**
   - Exemple : `/public_html/mail`

3. **Téléchargez la dernière version de Roundcube**
   - Allez sur : https://roundcube.net/download/
   - Téléchargez "Complete" (version complète)
   - Version actuelle : roundcubemail-1.6.x-complete.tar.gz

4. **Uploadez le fichier** dans le dossier `/public_html/mail`

5. **Extrayez l'archive**
   - Clic droit sur le fichier → Extract
   - Les fichiers seront dans `/public_html/mail/roundcubemail-1.6.x/`

6. **Déplacez les fichiers à la racine**
   - Sélectionnez tous les fichiers dans `roundcubemail-1.6.x/`
   - Déplacez-les vers `/public_html/mail/`
   - Supprimez le dossier vide `roundcubemail-1.6.x/`

### Option B : Via SSH (Si vous avez accès SSH)

```bash
# Connectez-vous en SSH
ssh votre-user@votreserveur.com

# Allez dans le dossier du sous-domaine
cd public_html/mail

# Téléchargez Roundcube
wget https://github.com/roundcube/roundcubemail/releases/download/1.6.5/roundcubemail-1.6.5-complete.tar.gz

# Extrayez l'archive
tar -xzf roundcubemail-1.6.5-complete.tar.gz

# Déplacez les fichiers
mv roundcubemail-1.6.5/* .
mv roundcubemail-1.6.5/.* . 2>/dev/null

# Nettoyage
rm -rf roundcubemail-1.6.5
rm roundcubemail-1.6.5-complete.tar.gz

# Définir les permissions
chmod 755 -R .
```

---

## Étape 3 : Créer une base de données MySQL

1. **Dans cPanel, allez dans "Bases de données MySQL"**

2. **Créez une nouvelle base de données**
   - Nom : `roundcube_db` (ou un nom de votre choix)
   - Cliquez sur "Créer une base de données"

3. **Créez un utilisateur MySQL**
   - Nom d'utilisateur : `roundcube_user`
   - Mot de passe : **Générez un mot de passe fort** (notez-le !)
   - Cliquez sur "Créer un utilisateur"

4. **Associez l'utilisateur à la base de données**
   - Sélectionnez l'utilisateur et la base de données
   - Cochez "TOUS LES PRIVILÈGES"
   - Cliquez sur "Apporter des modifications"

5. **Notez ces informations** :
   ```
   Nom de la base de données : username_roundcube_db
   Utilisateur : username_roundcube_user
   Mot de passe : [votre mot de passe]
   Hôte : localhost
   ```

---

## Étape 4 : Configuration de Roundcube via l'installateur Web

1. **Accédez à l'installateur**
   - URL : `https://mail.votredomaine.com/installer/`

2. **Page 1 : Vérification de l'environnement**
   - Vérifiez que tous les modules PHP requis sont présents (verts)
   - Si des modules sont manquants, contactez le support Hostinger
   - Cliquez sur "NEXT"

3. **Page 2 : Configuration de la base de données**

   **Section "Database setup"** :
   - Database type : `MySQL`
   - Database server : `localhost`
   - Database name : `username_roundcube_db` (votre nom complet)
   - Database user : `username_roundcube_user`
   - Database password : [votre mot de passe MySQL]

   **Section "General configuration"** :
   - Product name : `Au Matin Vert - Webmail` (ou votre nom)
   - Support URL : laissez vide ou votre site web

   **Section "IMAP Settings"** :
   - Default host : `ssl://mail.votredomaine.com` ou `ssl://mail.hostinger.com`
   - Default port : `993`
   - Username domain : laissez vide (sauf si tous vos emails sont @memedomaine.com)

   **Section "SMTP Settings"** :
   - SMTP server : `ssl://mail.votredomaine.com` ou `ssl://smtp.hostinger.com`
   - SMTP port : `465`
   - Use the current IMAP username and password for SMTP authentication : Cochez cette case

   **Section "Display settings & user prefs"** :
   - Language : `fr_FR` (Français)
   - Timezone : `Europe/Paris`

4. **Cliquez sur "CREATE CONFIG"**

5. **Téléchargez le fichier de configuration**
   - Un fichier `config.inc.php` sera généré
   - Téléchargez-le

6. **Uploadez le fichier de configuration**
   - Via le Gestionnaire de fichiers cPanel
   - Placez `config.inc.php` dans `/public_html/mail/config/`

---

## Étape 5 : Initialiser la base de données

1. **Retournez sur l'installateur**
   - URL : `https://mail.votredomaine.com/installer/`

2. **Cliquez sur "Initialize database"**
   - Les tables seront créées automatiquement
   - Vous devriez voir "Database initialized successfully"

---

## Étape 6 : Tester l'installation

1. **Sur la page de l'installateur, section "Test SMTP config"**
   - Sender : votre email
   - Recipient : votre email
   - Cliquez sur "Send test email"
   - Vérifiez que vous recevez l'email de test

2. **Section "Test IMAP config"**
   - Username : votre adresse email complète
   - Password : votre mot de passe email
   - Cliquez sur "Check login"
   - Vous devriez voir "IMAP connect: OK"

---

## Étape 7 : Sécuriser l'installation

### IMPORTANT : Supprimer le dossier installer

1. **Via le Gestionnaire de fichiers cPanel**
   - Naviguez vers `/public_html/mail/`
   - Supprimez le dossier `installer/` **COMPLÈTEMENT**
   - C'est une faille de sécurité si vous ne le faites pas !

2. **Ou via SSH** :
   ```bash
   cd public_html/mail
   rm -rf installer/
   ```

### Définir les permissions correctes

```bash
# Via SSH
cd public_html/mail
chmod 755 temp logs
chmod 644 config/config.inc.php
```

Ou via le Gestionnaire de fichiers :
- Dossiers `temp/` et `logs/` : permissions 755
- Fichier `config/config.inc.php` : permissions 644

---

## Étape 8 : Configuration avancée (Optionnel)

### Personnaliser l'apparence

1. **Éditez le fichier** `/public_html/mail/config/config.inc.php`

2. **Ajoutez ces paramètres** :

```php
// Personnalisation
$config['product_name'] = 'Au Matin Vert - Webmail';
$config['skin'] = 'elastic'; // Thème moderne
$config['support_url'] = 'https://votresite.com/contact';

// Performance
$config['enable_caching'] = true;
$config['messages_cache'] = 'db';

// Sécurité
$config['x_frame_options'] = false; // IMPORTANT pour l'iframe !
$config['force_https'] = true;

// Interface
$config['preview_pane'] = true;
$config['autoexpand_threads'] = 2;
$config['check_all_folders'] = true;
```

### Activer les plugins utiles

```php
$config['plugins'] = array(
    'archive',
    'zipdownload',
    'markasjunk',
    'emoticons',
    'attachment_reminder',
);
```

---

## Étape 9 : Intégration dans votre interface Admin

Une fois Roundcube installé et fonctionnel :

1. **Testez l'accès direct**
   - URL : `https://mail.votredomaine.com`
   - Connectez-vous avec vos identifiants email
   - Vérifiez que tout fonctionne

2. **Obtenez l'URL de votre installation**
   - Format : `https://mail.votredomaine.com/`

3. **Configurez l'iframe dans votre admin**
   - Je vais mettre à jour le composant EmailManager
   - Vous pourrez saisir votre URL Roundcube
   - L'email s'affichera directement dans l'interface !

---

## Dépannage

### Erreur "Database error"
- Vérifiez les identifiants de connexion MySQL dans `config/config.inc.php`
- Assurez-vous que la base de données existe
- Vérifiez que l'utilisateur a tous les privilèges

### Erreur "IMAP connection failed"
- Vérifiez les paramètres IMAP dans `config/config.inc.php`
- Pour Hostinger, utilisez : `ssl://mail.votredomaine.com` port `993`
- Ou contactez le support Hostinger pour les bons paramètres

### Erreur "SMTP connection failed"
- Vérifiez les paramètres SMTP
- Pour Hostinger, utilisez : `ssl://smtp.hostinger.com` port `465`

### Page blanche après installation
- Vérifiez les permissions des dossiers `temp/` et `logs/` (755)
- Vérifiez les logs PHP dans cPanel → Error Log

### L'iframe ne fonctionne pas
- Assurez-vous d'avoir mis `$config['x_frame_options'] = false;`
- Videz le cache de votre navigateur

---

## Support

- **Documentation Roundcube** : https://github.com/roundcube/roundcubemail/wiki
- **Support Hostinger** : https://support.hostinger.com
- **Forum Roundcube** : https://roundcubeforum.net/

---

## Prochaines étapes

Une fois Roundcube installé avec succès :

1. ✅ Notez votre URL : `https://mail.votredomaine.com`
2. ✅ Je vais mettre à jour l'interface admin pour intégrer l'iframe
3. ✅ Vous pourrez consulter vos emails directement dans l'admin !

**Besoin d'aide ?** N'hésitez pas à me demander si vous rencontrez des problèmes lors de l'installation.
