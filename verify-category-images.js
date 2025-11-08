import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function verifyCategories() {
  console.log('🔍 Verifying category images in database...\n');

  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, nom, image_url, actif')
      .eq('type_categorie', 'epicerie')
      .eq('actif', true)
      .order('position');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`Found ${categories.length} active categories:\n`);

    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.nom}`);
      console.log(`   Image: ${cat.image_url || '(no image)'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyCategories();
