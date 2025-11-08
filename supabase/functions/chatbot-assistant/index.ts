import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userMessage: string;
  apiKey?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, userMessage, apiKey }: ChatRequest = await req.json()

    // Valider que la clé API est fournie
    if (!apiKey) {
      throw new Error('Cle API Claude non configuree. Veuillez configurer la cle dans les parametres.')
    }

    // Contexte système pour l'assistant
    const systemPrompt = `Tu es un assistant IA bienveillant et expert qui aide les utilisateurs d'une application de gestion d'entreprise.

Cette application propose :
- Gestion de catalogue produits
- Boutique en ligne avec panier et paiement Stripe
- Generation de contenu avec IA (OpenAI et Claude)
- Publication sur les reseaux sociaux (Facebook et Instagram)
- Calendrier de posts planifies
- Gestion de commandes et clients
- Personnalisation des couleurs et themes
- Upload d'images et videos

Tu peux aider les utilisateurs avec :
1. Des questions sur comment utiliser l'application
2. Des conseils marketing et business
3. Des strategies de reseaux sociaux
4. Des idees de contenu
5. Des problemes techniques
6. Des questions sur l'e-commerce

Sois concis, utile et amical. Utilise des emojis pour rendre tes reponses plus engageantes. Si tu ne connais pas la reponse, dis-le honnetement et propose des alternatives.`

    // Construire l'historique de conversation
    const conversationHistory = messages.map(m => ({
      role: m.role,
      content: m.content
    }))

    // Appel à l'API Claude avec la clé fournie par l'utilisateur
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Erreur API Claude')
    }

    const data = await response.json()
    const assistantResponse = data.content[0]?.text || 'Desole, je ne peux pas repondre pour le moment.'

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Chatbot error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
