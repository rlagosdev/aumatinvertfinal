import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { appointmentId, clientName, callType } = await req.json()

    if (!appointmentId) {
      throw new Error('appointmentId is required')
    }

    // Récupérer la clé API Daily.co depuis les secrets Supabase
    const dailyApiKey = Deno.env.get('DAILY_API_KEY')
    if (!dailyApiKey) {
      throw new Error('DAILY_API_KEY not configured')
    }

    // Créer une salle Daily.co
    const roomResponse = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${dailyApiKey}`,
      },
      body: JSON.stringify({
        name: `aumatinvert-${appointmentId}`,
        privacy: 'private',
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: 'cloud',
          start_video_off: callType === 'audio',
          start_audio_off: false,
          max_participants: 2,
          exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expire dans 1 heure
        },
      }),
    })

    if (!roomResponse.ok) {
      const error = await roomResponse.text()
      console.error('Daily.co API error:', error)
      throw new Error(`Failed to create Daily room: ${error}`)
    }

    const room = await roomResponse.json()

    // Mettre à jour le rendez-vous avec l'URL de la salle
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseClient
      .from('video_call_appointments')
      .update({
        room_url: room.url,
        room_name: room.name
      })
      .eq('id', appointmentId)

    if (updateError) {
      console.error('Error updating appointment:', updateError)
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        roomUrl: room.url,
        roomName: room.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
