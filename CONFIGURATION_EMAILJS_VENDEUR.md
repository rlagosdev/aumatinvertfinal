# Configuration EmailJS - Email Vendeur

## 📋 Vue d'ensemble

Le système envoie maintenant **2 emails différents** lors d'une commande :
1. **Email CLIENT** : Confirmation de commande (template existant)
2. **Email VENDEUR** : Notification de nouvelle commande avec détails complets

---

## 🔧 Étapes de configuration sur EmailJS

### 1. Créer un nouveau template pour le vendeur

1. Connectez-vous sur **https://www.emailjs.com**
2. Allez dans **Email Templates**
3. Cliquez sur **Create New Template**
4. Nommez-le : `Notification Vendeur - Nouvelle Commande`

### 2. Configurer le template

#### **Settings (Paramètres)**
- **Template ID** : Notez l'ID généré (ex: `template_abc123`)
- **Template Name** : `Notification Vendeur - Nouvelle Commande`
- **Subject** : `🔔 Nouvelle commande #{{order_id}} - {{customer_name}}`
- **From Name** : `Au Matin Vert - Site Web`
- **To Email** : `{{to_email}}` ⚠️ IMPORTANT : Utilisez cette variable

#### **Content (Contenu)**
1. Cliquez sur **HTML** (pas Text)
2. Copiez-collez le contenu du fichier `email_template_vendor_notification.html`
3. Cliquez sur **Save**

### 3. Tester le template

1. Dans l'interface EmailJS, cliquez sur **Test It**
2. Remplissez les variables de test :
   ```
   order_id: AMV-TEST-12345
   customer_name: Jean Dupont
   email: jean.dupont@example.com
   customer_phone: 06 12 34 56 78
   to_email: contact@aumatinvert.fr
   cost.total: 45.50
   cost.shipping: 5.00
   pickup_date: vendredi 15 novembre 2024
   ```
3. Cliquez sur **Send Test Email**
4. Vérifiez la réception sur `contact@aumatinvert.fr`

### 4. Mettre à jour le fichier .env

Remplacez dans votre fichier `.env` :

```env
# Order notification - VENDEUR
VITE_EMAILJS_VENDOR_SERVICE_ID="service_618g1x9"
VITE_EMAILJS_VENDOR_TEMPLATE_ID="VOTRE_NOUVEAU_TEMPLATE_ID_ICI"

# Email du vendeur
VITE_VENDOR_EMAIL="contact@aumatinvert.fr"
```

**⚠️ Remplacez** `VOTRE_NOUVEAU_TEMPLATE_ID_ICI` par l'ID réel du template créé à l'étape 2.

---

## 📧 Différences entre les deux emails

### Email CLIENT (`template_wiqn6fa`)
- **Destinataire** : Client (email saisi dans le formulaire)
- **Ton** : Professionnel et rassurant
- **Contenu** :
  - Remerciement
  - Résumé de la commande
  - Informations de retrait
  - Contact du magasin

### Email VENDEUR (nouveau template)
- **Destinataire** : `contact@aumatinvert.fr`
- **Ton** : Informatif et actionnable
- **Contenu** :
  - 🔔 Alerte de nouvelle commande
  - **Informations client en évidence** (nom, email, téléphone)
  - Détails de la commande
  - **Boutons d'action** :
    - 📞 Appeler le client
    - ✉️ Envoyer un email
  - Rappel pour confirmer l'heure de retrait
  - Lien vers l'administration

---

## 🎨 Personnalisation du template vendeur

Vous pouvez modifier le template dans EmailJS pour :
- Changer les couleurs
- Ajouter des informations supplémentaires
- Modifier le texte
- Ajuster la mise en page

Les variables disponibles sont les mêmes que pour le template client :
- `{{order_id}}` - Numéro de commande
- `{{customer_name}}` - Nom du client
- `{{email}}` - Email du client
- `{{customer_phone}}` - Téléphone du client
- `{{orders}}` - Liste des produits (tableau)
- `{{cost.total}}` - Total
- `{{cost.shipping}}` - Frais de livraison
- `{{pickup_date}}` - Date de retrait formatée
- `{{to_email}}` - Email du destinataire (vendeur)

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

1. Passez une commande test sur le site
2. Vérifiez que **2 emails** sont envoyés :
   - ✉️ Un au **client** (confirmation)
   - ✉️ Un au **vendeur** (notification)
3. Vérifiez que les emails ont des contenus différents

---

## 🔒 Sécurité

- Le template vendeur affiche des informations sensibles (téléphone, email client)
- Assurez-vous que `VITE_VENDOR_EMAIL` pointe vers une adresse sécurisée
- Ne partagez jamais vos clés EmailJS publiquement

---

## 🆘 Dépannage

### L'email vendeur n'est pas reçu
1. Vérifiez que `VITE_EMAILJS_VENDOR_TEMPLATE_ID` est correct dans `.env`
2. Vérifiez que `VITE_VENDOR_EMAIL` est correct
3. Consultez les logs EmailJS sur le dashboard
4. Vérifiez les spams de votre boîte email

### Les deux emails ont le même contenu
1. Assurez-vous d'avoir créé un nouveau template distinct
2. Vérifiez que les IDs dans `.env` sont différents :
   - `VITE_EMAILJS_ORDER_TEMPLATE_ID` → Client
   - `VITE_EMAILJS_VENDOR_TEMPLATE_ID` → Vendeur

---

## 💡 Avantages de ce système

✅ **Séparation des préoccupations** : Chaque email a son propre objectif
✅ **Personnalisation** : Contenu adapté à chaque destinataire
✅ **Boutons d'action** : Le vendeur peut contacter directement le client
✅ **Mise en évidence** : Les infos importantes pour le vendeur sont en surbrillance
✅ **Simplicité** : Pas besoin de serveur SMTP supplémentaire, tout via EmailJS
