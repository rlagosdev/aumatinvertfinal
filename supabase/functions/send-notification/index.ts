// Edge Function Supabase pour envoyer des notifications push via Firebase Cloud Messaging API V1
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configuration Firebase Admin - utilise les variables d'environnement
const FIREBASE_CONFIG = {
  type: "service_account",
  project_id: "au-matin-vert",
  private_key_id: "2fca03cba56d9806fa889fbb963e4702712b9eb6",
  private_key: Deno.env.get('FIREBASE_PRIVATE_KEY') ?? '',
  client_email: "firebase-adminsdk-fbsvc@au-matin-vert.iam.gserviceaccount.com",
  client_id: "102786477800277960507",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fonction pour créer un JWT pour l'authentification Google
async function createJWT() {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: FIREBASE_CONFIG.client_email,
    sub: FIREBASE_CONFIG.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging'
  }

  const encoder = new TextEncoder()
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const signatureInput = `${headerB64}.${payloadB64}`

  // Import private key
  const pemHeader = '-----BEGIN PRIVATE KEY-----'
  const pemFooter = '-----END PRIVATE KEY-----'
  const pemContents = FIREBASE_CONFIG.private_key
    .replace(pemHeader, '')
    .replace(pemFooter, '')
    .replace(/\n/g, '')

  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(signatureInput)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${signatureInput}.${signatureB64}`
}

// Fonction pour obtenir un access token
async function getAccessToken() {
  const jwt = await createJWT()

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await response.json()
  return data.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Lire le body de la requête
    const requestBody = await req.json()

    console.log('📥 ========================================')
    console.log('📥 Requête reçue (body complet):', JSON.stringify(requestBody, null, 2))
    console.log('📥 ========================================')

    const { tokens, title, body, url, icon } = requestBody

    // Logs de debug pour voir ce qui est reçu
    console.log('🔍 Paramètres extraits:')
    console.log('  - tokens:', tokens?.length || 0, 'token(s)')
    console.log('  - title:', title, '(type:', typeof title, ')')
    console.log('  - body:', body, '(type:', typeof body, ')')
    console.log('  - url:', url, '(type:', typeof url, ')')
    console.log('  - icon:', icon, '(type:', typeof icon, ')')

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      console.error('❌ Erreur: Aucun token fourni')
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Vérifier que title et body sont fournis
    if (!title || title.trim() === '') {
      console.warn('⚠️ Attention: Titre vide ou non fourni, utilisation du titre par défaut')
    }
    if (!body || body.trim() === '') {
      console.warn('⚠️ Attention: Message vide ou non fourni, utilisation du message par défaut')
    }

    console.log('📧 Envoi de notification à', tokens.length, 'destinataire(s)')

    // Obtenir un access token
    const accessToken = await getAccessToken()
    console.log('✅ Access token Firebase obtenu')

    // Liste des tokens invalides à supprimer
    const invalidTokens: string[] = []

    // Envoyer la notification à tous les tokens avec l'API V1
    const results = await Promise.allSettled(
      tokens.map(async (token: string, index: number) => {
        // Préparer les valeurs avec des valeurs par défaut robustes
        const notificationTitle = (title && title.trim()) || 'Au Matin Vert'
        const notificationBody = (body && body.trim()) || 'Nouvelle notification'
        const notificationIcon = (icon && icon.trim()) || 'https://project-opal-eight-81.vercel.app/icon-192x192.png?v=3'
        const notificationUrl = (url && url.trim()) || 'https://project-opal-eight-81.vercel.app/'

        // Préparer le payload - UTILISER LE CHAMP DATA
        const messagePayload = {
          message: {
            token: token,
            data: {
              title: notificationTitle,
              body: notificationBody,
              icon: notificationIcon,
              url: notificationUrl
            },
            webpush: {
              headers: {
                Urgency: 'high'
              },
              fcm_options: {
                link: notificationUrl
              }
            }
          }
        }

        console.log(`📤 [Token ${index + 1}/${tokens.length}] Payload envoyé à FCM:`)
        console.log(JSON.stringify(messagePayload, null, 2))

        const response = await fetch(
          `https://fcm.googleapis.com/v1/projects/au-matin-vert/messages:send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(messagePayload)
          }
        )

        const result = await response.json()

        if (response.ok) {
          console.log(`✅ [Token ${index + 1}] Notification envoyée avec succès:`, token.substring(0, 20) + '...')
          console.log(`   Titre envoyé: "${notificationTitle}"`)
          console.log(`   Body envoyé: "${notificationBody}"`)
        } else {
          console.error(`❌ [Token ${index + 1}] Erreur lors de l'envoi:`, result)

          // Détecter les tokens invalides/non enregistrés
          if (result.error &&
              (result.error.status === 'NOT_FOUND' ||
               result.error.status === 'UNREGISTERED' ||
               result.error.code === 404 ||
               result.error.message?.includes('not found') ||
               result.error.message?.includes('Requested entity was not found'))) {
            console.log('🗑️ Token invalide détecté:', token.substring(0, 20) + '...')
            invalidTokens.push(token)
          }
        }

        return result
      })
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const errorCount = results.filter(r => r.status === 'rejected').length

    console.log('📊 ========================================')
    console.log(`📊 Résultat final: ${successCount} succès, ${errorCount} échecs`)
    console.log('📊 ========================================')

    // Supprimer les tokens invalides de la base de données
    if (invalidTokens.length > 0) {
      console.log(`🗑️ Suppression de ${invalidTokens.length} token(s) invalide(s)...`)

      try {
        // Créer le client Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Supprimer les tokens invalides
        const { error: deleteError } = await supabase
          .from('user_fcm_tokens')
          .delete()
          .in('fcm_token', invalidTokens)

        if (deleteError) {
          console.error('❌ Erreur lors de la suppression des tokens invalides:', deleteError)
        } else {
          console.log(`✅ ${invalidTokens.length} token(s) invalide(s) supprimé(s)`)
        }
      } catch (cleanupError) {
        console.error('❌ Erreur nettoyage tokens:', cleanupError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: tokens.length,
          success: successCount,
          failed: errorCount,
          invalidTokensRemoved: invalidTokens.length
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ========================================')
    console.error('❌ Erreur critique:', error)
    console.error('❌ Stack:', error.stack)
    console.error('❌ ========================================')
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
