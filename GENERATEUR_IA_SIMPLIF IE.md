# Générateur de Contenu IA - Simplifié ✨

## Ce qui a changé

Le **Générateur de Contenu IA** dans Publication Réseaux Sociaux utilise maintenant **automatiquement la même clé API Claude** que votre chatbot !

### Avant ❌
- L'utilisateur devait entrer manuellement sa clé API à chaque fois
- Choix entre OpenAI et Claude
- Configuration complexe avec sauvegarde locale

### Maintenant ✅
- **Utilise automatiquement la clé Claude** configurée dans `Paramètres → Chatbot IA`
- **Une seule clé pour toute la plateforme** (chatbot + générateur de contenu)
- Interface simplifiée : juste décrire ce que vous voulez, l'IA génère !
- Message clair si la clé n'est pas configurée

## Comment ça fonctionne

### 1. Configuration unique
Allez dans **Paramètres → Chatbot IA** et entrez votre clé API Claude (`sk-ant-api03-...`)

### 2. Utilisation partout
Cette même clé est utilisée pour :
- 🤖 **Chatbot Au Matin Vert AI** : Assistant intelligent sur le site
- ✨ **Générateur de Contenu IA** : Création de posts pour réseaux sociaux

### 3. Expérience simplifiée
Quand vous cliquez sur "Écrire avec IA" :
1. Le générateur charge automatiquement votre clé depuis la base de données
2. Vous décrivez ce que vous voulez
3. Claude génère le contenu parfait pour votre plateforme

## Avantages

### Pour l'utilisateur
- 🎯 **Plus simple** : Une seule clé à configurer
- 🔒 **Plus sécurisé** : Clé stockée dans la base de données côté serveur
- ⚡ **Plus rapide** : Pas besoin de rentrer la clé à chaque fois
- 💡 **Plus clair** : Message explicite si la clé manque

### Technique
- Même Edge Function Supabase (`chatbot-assistant`)
- Prompt système optimisé pour la création de contenu marketing
- Gestion centralisée des clés API
- Pas de stockage localStorage (plus sécurisé)

## Exemple d'utilisation

### Dans Publication Réseaux Sociaux > Publier

1. **Cliquez sur "Écrire avec IA"**
   - Ouvre le générateur

2. **Voir le message d'info**
   ```
   ✨ IA activée : Utilise la même clé API Claude que votre chatbot.
   La clé est configurée dans Paramètres → Chatbot IA.
   ```

3. **Décrivez votre contenu**
   ```
   Exemple: "Un post motivant sur les bienfaits du yoga
   pour la santé mentale, ton bienveillant et inspirant"
   ```

4. **Claude génère le contenu**
   - Adapté à la plateforme (Facebook, Instagram, LinkedIn, YouTube, X)
   - Professionnel et engageant
   - Prêt à publier !

5. **Utilisez le contenu**
   - Cliquez sur "Utiliser ce contenu"
   - Le texte est automatiquement inséré dans votre post

## Messages d'erreur

### "Clé API non configurée"
**Que faire** : Allez dans `Paramètres → Chatbot IA` et entrez votre clé Claude

### "Erreur lors de la génération"
**Causes possibles** :
- Clé API invalide ou expirée
- Quota API dépassé
- Problème de connexion

**Solution** : Vérifiez votre clé dans les paramètres

## Code technique

### Chargement automatique de la clé
```typescript
useEffect(() => {
  const fetchApiKey = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'chatbot_api_key')
      .maybeSingle();

    if (data?.setting_value) {
      setApiKey(data.setting_value);
    } else {
      toast.error('Clé API non configurée');
    }
  };

  fetchApiKey();
}, []);
```

### Appel à Claude
```typescript
const response = await fetch(`${supabaseUrl}/functions/v1/chatbot-assistant`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supabaseKey}`,
  },
  body: JSON.stringify({
    messages: [],
    userMessage: `Tu es un expert en marketing digital.
                  Crée un post pour ${platform} : ${userPrompt}`,
    apiKey
  })
});
```

## Plateformes supportées

Le générateur adapte automatiquement le contenu pour :

- 📘 **Facebook** : Posts engageants avec call-to-action
- 📷 **Instagram** : Captions courtes avec emojis et hashtags
- 💼 **LinkedIn** : Contenu professionnel et thought leadership
- 📹 **YouTube** : Descriptions de vidéos optimisées
- 🐦 **X (Twitter)** : Tweets concis (280 caractères max)

## FAQ

**Q: Puis-je encore utiliser OpenAI ?**
R: Non, le système utilise maintenant uniquement Claude. C'est plus simple et Claude est excellent pour la création de contenu marketing.

**Q: Ma clé est-elle sécurisée ?**
R: Oui ! Elle est stockée dans Supabase (base de données sécurisée) et jamais exposée côté client.

**Q: Ça coûte combien ?**
R: Claude a un tarif à l'usage. Pour la génération de contenu, c'est très peu cher (quelques centimes par génération).

**Q: Puis-je désactiver le générateur IA ?**
R: Oui, supprimez simplement votre clé API dans les paramètres.

## Avantages de Claude pour le marketing

### Pourquoi Claude ?
1. **Excellent en français** : Meilleure qualité que GPT pour le français
2. **Créatif et engageant** : Génère du contenu naturel et authentique
3. **Respecte les consignes** : Suit précisément vos instructions
4. **Adapté aux réseaux sociaux** : Comprend les codes de chaque plateforme
5. **Sécurisé** : Pas de stockage de vos prompts

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que votre clé Claude est valide
2. Consultez votre quota API sur console.anthropic.com
3. Vérifiez les logs dans la console du navigateur (F12)

## Prochaines étapes possibles

- [ ] Ajouter des templates pré-définis
- [ ] Suggérer des hashtags automatiquement
- [ ] Générer plusieurs variantes en un clic
- [ ] Adapter la longueur selon la plateforme
- [ ] Ajouter un historique des générations

---

**Résumé** : Une seule clé Claude pour toute votre plateforme. Plus simple, plus sécurisé, plus puissant ! 🚀
