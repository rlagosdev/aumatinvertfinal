import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkVideoConfig() {
  console.log('🔍 Vérification de la configuration des vidéos hero...\n');

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['hero_video_url', 'hero_video_url_desktop', 'hero_video_url_mobile']);

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('📹 Configuration actuelle:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    data.forEach(s => {
      console.log(`${s.setting_key}:`);
      console.log(`  ${s.setting_value}\n`);
    });

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

checkVideoConfig().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
