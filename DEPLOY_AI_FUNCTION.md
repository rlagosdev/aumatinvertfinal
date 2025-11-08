# Déployer la fonction IA sur Supabase

## Prérequis

1. Avoir Supabase CLI installé : https://supabase.com/docs/guides/cli
2. Être connecté à votre projet Supabase

## Étapes de déploiement

### 1. Installer Supabase CLI (si pas déjà fait)

```bash
npm install -g supabase
```

### 2. Se connecter à Supabase

```bash
supabase login
```

### 3. Lier votre projet local au projet Supabase

```bash
cd "C:\Users\rlago\Downloads\site nouveau\project"
supabase link --project-ref <VOTRE_PROJECT_REF>
```

Vous pouvez trouver votre `project-ref` dans l'URL de votre projet Supabase :
`https://supabase.com/dashboard/project/<PROJECT_REF>`

### 4. Déployer la fonction Edge

```bash
supabase functions deploy generate-ai-content
```

### 5. Vérifier le déploiement

Une fois déployé, la fonction sera accessible à :
```
https://<VOTRE_PROJECT_REF>.supabase.co/functions/v1/generate-ai-content
```

## Test de la fonction

Vous pouvez tester la fonction avec curl :

### Test avec OpenAI

```bash
curl -X POST \
  https://<VOTRE_PROJECT_REF>.supabase.co/functions/v1/generate-ai-content \
  -H "Authorization: Bearer <VOTRE_SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "apiKey": "sk-proj-...",
    "prompt": "Écris un post Instagram sur le yoga",
    "platform": "instagram"
  }'
```

### Test avec Claude

```bash
curl -X POST \
  https://<VOTRE_PROJECT_REF>.supabase.co/functions/v1/generate-ai-content \
  -H "Authorization: Bearer <VOTRE_SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "claude",
    "apiKey": "sk-ant-...",
    "prompt": "Écris un post Facebook sur les bienfaits de la méditation",
    "platform": "facebook"
  }'
```

## Troubleshooting

### Erreur : "Function not found"
- Vérifiez que la fonction est bien déployée avec `supabase functions list`
- Assurez-vous d'utiliser le bon URL et project-ref

### Erreur : "Authorization required"
- Vérifiez que vous utilisez la bonne clé Supabase anon dans le header Authorization

### Erreur : "Invalid API key"
- Vérifiez que la clé API OpenAI/Claude est valide
- Pour OpenAI : https://platform.openai.com/api-keys
- Pour Claude : https://console.anthropic.com/account/keys

## Architecture

La fonction Edge agit comme un proxy sécurisé entre votre frontend et les APIs d'IA :

```
Frontend (React)
    ↓
Supabase Edge Function (Deno)
    ↓
OpenAI API / Anthropic API
```

Cela permet de :
- ✅ Contourner les restrictions CORS
- ✅ Garder les clés API sécurisées (elles ne transitent que dans les requêtes)
- ✅ Avoir un point d'entrée unique pour plusieurs providers IA
