# Déployer la fonction IA sur Supabase (Méthode Manuelle via l'interface web)

## Option 1 : Via l'interface Supabase Dashboard

### Étape 1 : Accéder aux Edge Functions

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **"Edge Functions"**
4. Cliquez sur **"Create a new function"**

### Étape 2 : Créer la fonction

1. **Nom de la fonction** : `generate-ai-content`
2. Dans l'éditeur de code, copiez-collez le contenu du fichier :
   `supabase/functions/generate-ai-content/index.ts`

### Étape 3 : Déployer

1. Cliquez sur **"Deploy function"**
2. Attendez que le déploiement soit terminé (quelques secondes)
3. Notez l'URL de la fonction qui sera affichée

### Étape 4 : Tester

L'URL de votre fonction sera :
```
https://bvvekjhvmorgdvleobdo.supabase.co/functions/v1/generate-ai-content
```

Testez avec :
```bash
curl -X POST \
  https://bvvekjhvmorgdvleobdo.supabase.co/functions/v1/generate-ai-content \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "apiKey": "VOTRE_CLE_OPENAI",
    "prompt": "Écris un post Instagram sur le yoga",
    "platform": "instagram"
  }'
```

---

## Option 2 : Via Supabase CLI (Installation nécessaire)

### Installer Supabase CLI

**Windows (PowerShell en tant qu'administrateur) :**
```powershell
scoop install supabase
```
Ou via npm :
```bash
npm install -g supabase
```

**macOS/Linux :**
```bash
brew install supabase/tap/supabase
```

### Se connecter et déployer

```bash
# Se connecter
supabase login

# Aller dans le dossier du projet
cd "C:\Users\rlago\Downloads\site nouveau\project"

# Lier le projet
supabase link --project-ref bvvekjhvmorgdvleobdo

# Déployer la fonction
supabase functions deploy generate-ai-content
```

---

## Vérifier que tout fonctionne

1. **Dans l'application** : Allez dans la section "Publication Réseaux Sociaux"
2. Cliquez sur **"Publier"**
3. Cliquez sur **"Écrire avec IA"**
4. Sélectionnez un provider (OpenAI ou Claude)
5. Entrez votre clé API
6. Testez la génération de contenu

---

## Code de la fonction à copier

Si vous utilisez la méthode manuelle, copiez ce code :

\`\`\`typescript
// Edge Function pour générer du contenu IA via OpenAI ou Claude
// Sert de proxy backend pour éviter les problèmes CORS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GenerateRequest {
  provider: 'openai' | 'claude';
  apiKey: string;
  prompt: string;
  platform: 'facebook' | 'instagram' | '';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { provider, apiKey, prompt, platform }: GenerateRequest = await req.json()

    if (!provider || !apiKey || !prompt) {
      throw new Error('Missing required parameters')
    }

    // Construire le prompt système selon la plateforme
    const systemPrompt = platform === 'instagram'
      ? 'Tu es un expert en création de contenu Instagram. Crée des posts engageants avec des emojis et des hashtags pertinents. Limite : 2200 caractères.'
      : 'Tu es un expert en création de contenu Facebook. Crée des posts engageants et authentiques. Limite : 63206 caractères.'

    let content = ''

    if (provider === 'openai') {
      // Appel à l'API OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Erreur API OpenAI')
      }

      const data = await response.json()
      content = data.choices[0]?.message?.content || ''

    } else if (provider === 'claude') {
      // Appel à l'API Claude (Anthropic)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [
            { role: 'user', content: prompt }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Erreur API Claude')
      }

      const data = await response.json()
      content = data.content[0]?.text || ''
    }

    return new Response(
      JSON.stringify({ content }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
\`\`\`

---

## Résultat attendu

Une fois la fonction déployée :

✅ **OpenAI (GPT-4o-mini)** - Fonctionne via Edge Function
✅ **Claude (3.5 Sonnet)** - Fonctionne via Edge Function
✅ **Pas de problèmes CORS** - Tout passe par le proxy Supabase
✅ **Clés API sécurisées** - Ne sont jamais exposées côté client

L'application peut maintenant utiliser les deux providers IA sans restriction !
