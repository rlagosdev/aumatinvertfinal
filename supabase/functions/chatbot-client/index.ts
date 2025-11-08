import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, userMessage, apiKey } = await req.json();

    // Valider que la clé API est fournie
    if (!apiKey) {
      throw new Error('Clé API Claude non configurée.');
    }

    // Contexte système pour l'assistant CLIENT
    const systemPrompt = `Tu es l'assistant virtuel de l'épicerie Au Matin Vert, un commerce de proximité chaleureux et accueillant.

INFORMATIONS SUR L'ÉPICERIE :
- Nom : Au Matin Vert
- Type : Épicerie de quartier proposant des produits frais et de qualité
- Spécialités : Fruits et légumes frais, produits d'épicerie, produits locaux, conseils personnalisés
- Philosophie : Proximité, qualité, service client et sourire

TU PEUX AIDER LES CLIENTS AVEC :
1. Découvrir nos produits et nos nouveautés
2. Conseils pour cuisiner et préparer de bons repas
3. Idées de recettes simples et savoureuses
4. Informations sur nos horaires d'ouverture et notre localisation
5. Questions sur les labels et certifications de nos produits
6. Aide à la navigation sur notre site web
7. Informations sur nos promotions et offres spéciales
8. Conseils pour bien conserver vos aliments
9. Questions sur les ingrédients, allergènes et compositions
10. Suggestions de produits selon vos besoins

TON STYLE DE COMMUNICATION :
- Sois chaleureux, souriant et authentique comme un vrai commerçant de quartier
- Utilise des emojis avec parcimonie pour être convivial (🥕 🍎 🥬 🌱 ✨ 😊)
- Parle de façon naturelle et accessible, sans jargon technique
- Sois enthousiaste quand tu parles de nos produits frais et de saison
- Reste concis mais informatif - des réponses courtes et utiles
- Si tu ne sais pas, dis-le honnêtement et propose de contacter le magasin directement

CE QUI NOUS REND SPÉCIAUX :
- Produits frais sélectionnés avec soin
- Producteurs locaux et circuits courts privilégiés
- Conseils personnalisés et service de proximité
- Engagement pour la qualité et la fraîcheur
- Prix justes et promotions régulières

IMPORTANT - TES LIMITES :
- NE donne JAMAIS de conseils médicaux
- NE remplace JAMAIS l'avis d'un médecin, nutritionniste ou professionnel de santé
- Pour toute question médicale ou diététique spécifique, recommande de consulter un professionnel
- Ne garantis pas la disponibilité des produits en temps réel
- Encourage toujours le client à venir visiter le magasin pour découvrir tous nos produits

EXEMPLES DE TON TON :
- "Super choix ! 😊 Nos tomates sont arrivées ce matin, elles sont délicieuses en salade !"
- "Je vous recommande notre sélection de fromages locaux, ils sont vraiment excellents 🧀"
- "Pour cette recette, vous trouverez tout chez nous ! Passez nous voir, on vous aidera avec plaisir ✨"`;

    // Construire l'historique de conversation
    const conversationHistory = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    // Appel à l'API Claude
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
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erreur API Claude');
    }

    const data = await response.json();
    const assistantResponse = data.content[0]?.text ||
      'Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer.';

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error: any) {
    console.error('Chatbot client error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});
