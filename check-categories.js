// Script pour vérifier les catégories dans la base de données
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
  console.log('=== Vérification des catégories de produits ===');
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (catError) {
    console.error('Erreur catégories produits:', catError);
  } else {
    console.log('Catégories de produits trouvées:', categories?.length);
    categories?.forEach(cat => {
      console.log(`  - ${cat.name}`);
    });
  }

  console.log('\n=== Vérification des catégories d\'événements ===');
  const { data: eventSettings, error: eventError } = await supabase
    .from('site_settings')
    .select('*')
    .eq('setting_key', 'event_categories')
    .single();

  if (eventError) {
    console.error('Erreur catégories événements:', eventError);
  } else {
    console.log('Setting trouvé:', eventSettings);
    if (eventSettings?.setting_value) {
      try {
        const eventCats = JSON.parse(eventSettings.setting_value);
        console.log('Catégories d\'événements:', eventCats);
        eventCats.forEach(cat => {
          console.log(`  - ${cat}`);
        });
      } catch (e) {
        console.error('Erreur parsing:', e);
      }
    }
  }
}

checkCategories();
