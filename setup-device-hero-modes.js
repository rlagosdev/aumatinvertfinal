import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDeviceHeroModes() {
  console.log('🚀 Configuration des modes hero par appareil...\n');

  try {
    // Configuration: PC = video, Mobile = carousel
    const settings = [
      {
        setting_key: 'home_hero_type_desktop',
        setting_value: 'video',
        description: 'Type de hero sur ordinateur (video ou carousel)'
      },
      {
        setting_key: 'home_hero_type_mobile',
        setting_value: 'carousel',
        description: 'Type de hero sur mobile (video ou carousel)'
      }
    ];

    for (const setting of settings) {
      console.log(`📝 Configuration de ${setting.setting_key}...`);

      // Vérifier si existe déjà
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('setting_key', setting.setting_key)
        .single();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('site_settings')
          .update({
            setting_value: setting.setting_value,
            description: setting.description
          })
          .eq('setting_key', setting.setting_key);

        if (error) throw error;
        console.log(`   ✅ Mise à jour: ${setting.setting_key} = ${setting.setting_value}`);
      } else {
        // Insert
        const { error } = await supabase
          .from('site_settings')
          .insert([setting]);

        if (error) throw error;
        console.log(`   ✅ Création: ${setting.setting_key} = ${setting.setting_value}`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Configuration terminée !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 PC: Mode Vidéo');
    console.log('📱 Mobile: Mode Carrousel');
    console.log('\nVous pouvez maintenant modifier ces paramètres dans l\'admin.');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

setupDeviceHeroModes().then(() => {
  process.exit(0);
});
