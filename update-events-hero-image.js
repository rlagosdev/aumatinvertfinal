import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateEventsHeroImage() {
  console.log('🔄 Mise à jour de l\'image hero de la page événements...');

  const newImageUrl = 'https://files.catbox.moe/r6kdr0.jpg';

  try {
    // Mettre à jour l'image hero
    const { data, error } = await supabase
      .from('evenements_config')
      .update({ image_url: newImageUrl })
      .eq('section_key', 'hero')
      .select();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }

    console.log('✅ Image hero mise à jour avec succès!');
    console.log('📊 Résultat:', data);
    console.log('🖼️  Nouvelle URL:', newImageUrl);
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

updateEventsHeroImage().then(() => {
  console.log('✨ Terminé!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
