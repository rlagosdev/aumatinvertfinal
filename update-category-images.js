import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Mapping of category names to new local image paths
const categoryImageMapping = {
  'Produits laitiers': '/categories/produits-laitiers.jpeg',
  'Biscuits apéritifs': '/categories/biscuits-aperitifs.jpeg',
  'Légumes': '/categories/legumes.jpeg',
  'Conserves de légumes': '/categories/conserves-legumes.jpeg',
  'Biscuits': '/categories/biscuits.jpeg',
  'Chocolats': '/categories/chocolats.jpeg',
  'Confitures': '/categories/confitures.jpeg',
  'Fruits': '/categories/fruits.jpeg',
  'Jus & boissons': '/categories/jus-boissons.jpeg'
};

async function updateCategoryImages() {
  console.log('🔄 Starting category image updates...\n');

  try {
    // First, fetch all categories to see what we have
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, nom, image_url')
      .eq('type_categorie', 'epicerie')
      .eq('actif', true);

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
      return;
    }

    console.log(`Found ${categories.length} categories:\n`);
    categories.forEach(cat => {
      console.log(`  - ${cat.nom}: ${cat.image_url || '(no image)'}`);
    });
    console.log('');

    // Update each category with the new image path
    for (const category of categories) {
      const newImagePath = categoryImageMapping[category.nom];

      if (newImagePath) {
        console.log(`📝 Updating "${category.nom}"...`);
        console.log(`   Old: ${category.image_url || '(none)'}`);
        console.log(`   New: ${newImagePath}`);

        const { data: updateData, error: updateError } = await supabase
          .from('categories')
          .update({ image_url: newImagePath })
          .eq('id', category.id)
          .select();

        if (updateError) {
          console.error(`   ❌ Error updating ${category.nom}:`, updateError);
          console.error(`   Error details:`, JSON.stringify(updateError, null, 2));
        } else if (updateData && updateData.length > 0) {
          console.log(`   ✅ Updated successfully - New URL: ${updateData[0].image_url}`);
        } else {
          console.log(`   ⚠️  Update returned no data - may have failed silently`);
        }
        console.log('');
      } else {
        console.log(`⚠️  No image mapping found for "${category.nom}"`);
        console.log('');
      }
    }

    console.log('✨ Category image update complete!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the update
updateCategoryImages();
