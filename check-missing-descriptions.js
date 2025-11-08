import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingDescriptions() {
  try {
    console.log('🔍 Vérification des produits sans description...\n');

    const { data: products, error } = await supabase
      .from('products')
      .select('id, nom, categorie, description')
      .or('description.is.null,description.eq.');

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('✅ Tous les produits ont une description !');
      return;
    }

    console.log(`📝 ${products.length} produits sans description trouvés:\n`);

    products.forEach((p, index) => {
      console.log(`${index + 1}. "${p.nom}" (${p.categorie})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

checkMissingDescriptions();
