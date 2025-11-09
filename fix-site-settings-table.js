import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSiteSettings() {
  console.log('🔧 Vérification et correction de la table site_settings...\n');

  try {
    // Test 1: Vérifier si la table existe
    console.log('1️⃣ Test de connexion à site_settings...');
    const { data: testData, error: testError } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur:', testError.message);
      console.log('\n💡 Solution: La table site_settings semble avoir un problème.');
      console.log('   Vérifiez dans Supabase Dashboard > Table Editor que:');
      console.log('   - La table "site_settings" existe');
      console.log('   - RLS (Row Level Security) est désactivé OU');
      console.log('   - Des policies permettent SELECT/INSERT/UPDATE pour tous');
      return;
    }

    console.log('✅ Table accessible\n');

    // Test 2: Vérifier la structure
    console.log('2️⃣ Vérification de la structure...');
    if (testData && testData.length > 0) {
      console.log('✅ Structure OK:', Object.keys(testData[0]).join(', '));
    }

    // Test 3: Ajouter les clés manquantes pour les vidéos
    console.log('\n3️⃣ Ajout des paramètres pour vidéos hero...');

    const videoSettings = [
      {
        setting_key: 'hero_video_url_desktop',
        setting_value: '/hero-video.mp4',
        description: 'URL de la vidéo hero pour ordinateur'
      },
      {
        setting_key: 'hero_video_url_mobile',
        setting_value: '/hero-video-mobile.mp4',
        description: 'URL de la vidéo hero pour mobile'
      }
    ];

    for (const setting of videoSettings) {
      // Vérifier si existe
      const { data: existing } = await supabase
        .from('site_settings')
        .select('setting_key')
        .eq('setting_key', setting.setting_key)
        .single();

      if (!existing) {
        console.log(`   Ajout de ${setting.setting_key}...`);
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert([setting]);

        if (insertError) {
          console.error(`   ❌ Erreur: ${insertError.message}`);
        } else {
          console.log(`   ✅ ${setting.setting_key} ajouté`);
        }
      } else {
        console.log(`   ⏭️  ${setting.setting_key} existe déjà`);
      }
    }

    console.log('\n✨ Vérification terminée !');

  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

fixSiteSettings().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
