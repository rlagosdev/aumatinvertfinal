import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAnnonceImage() {
  console.log('🔄 Mise à jour de l\'URL de l\'image d\'annonce...');

  // Vérifier si la clé existe
  const { data: existing, error: selectError } = await supabase
    .from('site_settings')
    .select('*')
    .eq('setting_key', 'annonce_image')
    .single();

  if (selectError && selectError.code !== 'PGRST116') {
    console.error('❌ Erreur lors de la vérification:', selectError);
    return;
  }

  console.log('📋 Valeur actuelle:', existing?.setting_value);

  if (existing) {
    // Update
    const { error } = await supabase
      .from('site_settings')
      .update({ setting_value: '/annonces/annonce-fromage-transparent.png' })
      .eq('setting_key', 'annonce_image');

    if (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
    } else {
      console.log('✅ URL mise à jour avec succès: /annonces/annonce-fromage.jpg');
    }
  } else {
    // Insert
    const { error } = await supabase
      .from('site_settings')
      .insert([{
        setting_key: 'annonce_image',
        setting_value: '/annonces/annonce-fromage-transparent.png',
        description: 'Image de l\'annonce'
      }]);

    if (error) {
      console.error('❌ Erreur lors de l\'insertion:', error);
    } else {
      console.log('✅ URL créée avec succès: /annonces/annonce-fromage.jpg');
    }
  }

  // Vérifier le résultat
  const { data: result } = await supabase
    .from('site_settings')
    .select('*')
    .eq('setting_key', 'annonce_image')
    .single();

  console.log('📊 Nouvelle valeur:', result?.setting_value);
}

updateAnnonceImage().then(() => {
  console.log('✨ Terminé!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
