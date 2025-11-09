import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEventsHero() {
  console.log('🔍 Vérification de l\'image hero de la page événements...\n');

  try {
    const { data, error } = await supabase
      .from('evenements_config')
      .select('*')
      .eq('section_key', 'hero')
      .single();

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    if (data) {
      console.log('📋 Configuration actuelle du hero:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID:', data.id);
      console.log('Section Key:', data.section_key);
      console.log('Titre:', data.titre);
      console.log('Description:', data.description);
      console.log('Image URL:', data.image_url);
      console.log('Position:', data.position);
      console.log('Actif:', data.actif);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      if (data.image_url === 'https://files.catbox.moe/r6kdr0.jpg') {
        console.log('✅ L\'image est bien mise à jour avec le lien catbox!');
      } else {
        console.log('⚠️  L\'image n\'est pas encore mise à jour.');
        console.log('📍 URL attendue: https://files.catbox.moe/r6kdr0.jpg');
        console.log('📍 URL actuelle:', data.image_url);
      }
    } else {
      console.log('⚠️  Aucune configuration hero trouvée');
    }
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

checkEventsHero().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
