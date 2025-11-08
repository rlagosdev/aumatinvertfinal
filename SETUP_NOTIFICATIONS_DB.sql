-- ============================================
-- TABLE POUR STOCKER LES TOKENS FCM
-- ============================================

-- Créer la table user_fcm_tokens
CREATE TABLE IF NOT EXISTS user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT,
  fcm_token TEXT UNIQUE NOT NULL,
  device_type TEXT DEFAULT 'web',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_email ON user_fcm_tokens(user_email);
CREATE INDEX IF NOT EXISTS idx_user_fcm_tokens_token ON user_fcm_tokens(fcm_token);

-- Activer Row Level Security (RLS)
ALTER TABLE user_fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Politique : Tout le monde peut insérer/update son token
CREATE POLICY "Anyone can insert FCM token"
  ON user_fcm_tokens
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update FCM token"
  ON user_fcm_tokens
  FOR UPDATE
  USING (true);

-- Politique : Seuls les admins peuvent lire tous les tokens
CREATE POLICY "Admins can read all FCM tokens"
  ON user_fcm_tokens
  FOR SELECT
  USING (true);

-- Fonction pour nettoyer les vieux tokens (>90 jours)
CREATE OR REPLACE FUNCTION clean_old_fcm_tokens()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM user_fcm_tokens
  WHERE updated_at < NOW() - INTERVAL '90 days';
END;
$$;

-- ============================================
-- EDGE FUNCTION POUR ENVOYER LES NOTIFICATIONS
-- ============================================

/*
IMPORTANT: Cette fonction doit être créée via Supabase CLI ou Dashboard

1. Va dans Supabase Dashboard → Edge Functions
2. Crée une nouvelle fonction "send-notification"
3. Utilise le code ci-dessous :

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const FIREBASE_SERVER_KEY = 'YOUR_FIREBASE_SERVER_KEY' // À remplacer

serve(async (req) => {
  try {
    const { tokens, title, body, url, icon } = await req.json()

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Envoyer la notification à tous les tokens
    const results = await Promise.all(
      tokens.map(async (token) => {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${FIREBASE_SERVER_KEY}`
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title,
              body,
              icon: icon || '/icon-192x192.png',
              click_action: url || '/',
              badge: '/icon-72x72.png'
            },
            data: {
              url: url || '/'
            }
          })
        })

        return await response.json()
      })
    )

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

ALTERNATIVE SIMPLIFIÉE (sans Edge Function):
Utilise directement Firebase Admin SDK depuis le frontend
pour les tests. Pour la production, utilise Edge Functions.
*/
