import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateEventsHeroImage() {
  console.log('🔄 Mise à jour de l\'image hero de la page événements...\n');

  const newImageUrl = 'https://files.catbox.moe/r6kdr0.jpg';
  const heroId = '4fced81d-f591-49c7-9aad-8eaf29d6c4c6';

  try {
    // Vérifier l'état actuel
    console.log('📋 Vérification de l\'état actuel...');
    const { data: current } = await supabase
      .from('evenements_config')
      .select('*')
      .eq('id', heroId)
      .single();

    console.log('📍 URL actuelle:', current?.image_url);
    console.log('📍 Nouvelle URL:', newImageUrl);
    console.log('');

    // Mettre à jour l'image hero par ID
    const { data, error } = await supabase
      .from('evenements_config')
      .update({ image_url: newImageUrl })
      .eq('id', heroId)
      .select();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      return;
    }

    console.log('✅ Image hero mise à jour avec succès!');
    console.log('📊 Résultat:', data);

    // Vérifier que la mise à jour a bien eu lieu
    const { data: updated } = await supabase
      .from('evenements_config')
      .select('image_url')
      .eq('id', heroId)
      .single();

    console.log('\n🔍 Vérification finale:');
    console.log('📍 URL dans la base:', updated?.image_url);

    if (updated?.image_url === newImageUrl) {
      console.log('✅ Mise à jour confirmée!');
    } else {
      console.log('⚠️  La mise à jour n\'a pas été appliquée');
    }
  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

updateEventsHeroImage().then(() => {
  console.log('\n✨ Terminé!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
