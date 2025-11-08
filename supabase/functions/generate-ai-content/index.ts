// Edge Function pour générer du contenu IA via OpenAI ou Claude
// Sert de proxy backend pour éviter les problèmes CORS

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
          'Authorization': `Bearer ${apiKey}`
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
