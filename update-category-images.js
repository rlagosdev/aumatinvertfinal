import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function updateCategoryImages() {
  console.log('🔄 Mise à jour des images de catégories...\n');

  try {
    // Récupérer les catégories Biscuits apéritifs et Chocolats
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, nom, image_url')
      .in('nom', ['Biscuits apéritifs', 'Chocolats']);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return;
    }

    if (!categories || categories.length === 0) {
      console.error('❌ Catégories non trouvées');
      return;
    }

    const biscuits = categories.find(c => c.nom === 'Biscuits apéritifs');
    const chocolat = categories.find(c => c.nom === 'Chocolats');

    if (!biscuits) {
      console.error('❌ Catégorie "Biscuits apéritifs" non trouvée');
      return;
    }
    if (!chocolat) {
      console.error('❌ Catégorie "Chocolats" non trouvée');
      return;
    }

    console.log('📋 État initial:');
    console.log(`   Biscuits apéritifs: ${biscuits.image_url || '(aucune image)'}`);
    console.log(`   Chocolats: ${chocolat.image_url || '(aucune image)'}\n`);

    if (!biscuits.image_url) {
      console.error('❌ La catégorie "Biscuits apéritifs" n\'a pas d\'image à transférer');
      return;
    }

    // Étape 1: Transférer l'image de Biscuits apéritifs vers Chocolats
    console.log('🔄 Transfert de l\'image de "Biscuits apéritifs" vers "Chocolats"...');
    const { data: chocolatUpdate, error: updateChocolatError } = await supabase
      .from('categories')
      .update({ image_url: biscuits.image_url })
      .eq('id', chocolat.id)
      .select();

    if (updateChocolatError) {
      console.error('❌ Erreur lors de la mise à jour de Chocolats:', updateChocolatError);
      return;
    }
    console.log('✅ Image de "Chocolats" mise à jour');
    console.log(`   Nouvelle valeur: ${chocolatUpdate && chocolatUpdate[0] ? chocolatUpdate[0].image_url : 'N/A'}\n`);

    // Étape 2: Supprimer l'image de Biscuits apéritifs
    console.log('🗑️  Suppression de l\'image de "Biscuits apéritifs"...');
    const { data: biscuitsUpdate, error: updateBiscuitsError } = await supabase
      .from('categories')
      .update({ image_url: null })
      .eq('id', biscuits.id)
      .select();

    if (updateBiscuitsError) {
      console.error('❌ Erreur lors de la mise à jour de Biscuits apéritifs:', updateBiscuitsError);
      return;
    }
    console.log('✅ Image de "Biscuits apéritifs" supprimée');
    console.log(`   Nouvelle valeur: ${biscuitsUpdate && biscuitsUpdate[0] && biscuitsUpdate[0].image_url ? biscuitsUpdate[0].image_url : '(aucune)'}\n`);

    // Vérification finale
    console.log('🔍 Vérification des modifications...\n');
    const { data: updatedCategories } = await supabase
      .from('categories')
      .select('id, nom, image_url')
      .in('nom', ['Biscuits apéritifs', 'Chocolats']);

    const updatedBiscuits = updatedCategories.find(c => c.nom === 'Biscuits apéritifs');
    const updatedChocolat = updatedCategories.find(c => c.nom === 'Chocolats');

    console.log('📋 État final:');
    console.log(`   Biscuits apéritifs: ${updatedBiscuits.image_url || '(aucune image)'}`);
    console.log(`   Chocolats: ${updatedChocolat.image_url || '(aucune image)'}\n`);

    console.log('✅ Modifications terminées avec succès !');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

// Run the update
updateCategoryImages();
