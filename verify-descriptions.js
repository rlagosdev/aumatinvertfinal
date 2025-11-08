import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDescriptions() {
  try {
    console.log('🔍 Vérification des descriptions dans la base de données...\n');

    // Récupérer les produits "Alternatives café"
    const { data: products, error } = await supabase
      .from('products')
      .select('id, nom, categorie, description')
      .eq('categorie', 'Alternatives café');

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    if (!products || products.length === 0) {
      console.log('❌ Aucun produit trouvé');
      return;
    }

    console.log(`📝 ${products.length} produits "Alternatives café" trouvés:\n`);

    products.forEach((p) => {
      console.log(`Produit: ${p.nom}`);
      console.log(`Description: ${p.description || 'PAS DE DESCRIPTION'}`);
      console.log(`Longueur: ${p.description ? p.description.length : 0} caractères`);
      console.log('---');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

verifyDescriptions();
