import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkCarouselImages() {
  console.log('🔍 Recherche de toutes les images du carrousel...\n');

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .like('setting_key', '%carousel%')
      .order('setting_key');

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log(`📋 Trouvé ${data.length} entrées de carrousel:\n`);
    data.forEach(setting => {
      const value = setting.setting_value || '(vide)';
      console.log(`  • ${setting.setting_key}`);
      console.log(`    URL: ${value}\n`);
    });

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

checkCarouselImages();
