import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmsdukdrcqjcnlekjdrd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttc2R1a2RyY3FqY25sZWtqZHJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyNzQ1NzY3MSwiZXhwIjoyMDQzMDMzNjcxfQ.R4oa0AxYwBCRBJbumJMON0LmUdUIe3LuEL9KLrNd7dw';

const supabase = createClient(supabaseUrl, supabaseKey);

// Images codées en dur à migrer
const categoryImages = {
  'Produits laitiers': [
    '/categories/produits-laitiers.jpeg',
    '/categories/produits-laitiers-2.jpeg',
    '/categories/produits-laitiers-3.jpeg',
    '/categories/produits-laitiers-4.jpeg'
  ],
  'Fruits': [
    '/categories/fruits.jpeg',
    '/categories/fruits-2.jpeg',
    '/categories/fruits-3.jpeg'
  ],
  'Confitures': [
    '/categories/confitures.jpeg',
    '/categories/confitures-2.jpeg'
  ],
  'Biscuits apéritifs': [
    '/categories/biscuits-aperitifs.jpeg',
    '/categories/biscuits-aperitifs-2.jpeg'
  ],
  'Alternatives café': ['/categories/alternatives-cafe.jpeg'],
  'Légumes': ['/categories/legumes.jpeg'],
  'Conserves de légumes': ['/categories/conserves-legumes.jpeg'],
  'Biscuits': ['/categories/biscuits.jpeg'],
  'Chocolats': ['/categories/chocolats.jpeg'],
  'Conserves de poisson': ['/categories/conserves-poisson.jpeg'],
  'Jus & boissons': ['/categories/jus-boissons.jpeg']
};

async function migrateImages() {
  console.log('🚀 Démarrage de la migration des images du carrousel...\n');

  try {
    // 1. Récupérer toutes les catégories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, nom');

    if (categoriesError) {
      throw categoriesError;
    }

    console.log(`✓ ${categories.length} catégories trouvées\n`);

    let totalMigrated = 0;
    let totalSkipped = 0;

    // 2. Pour chaque catégorie, insérer les images correspondantes
    for (const category of categories) {
      const images = categoryImages[category.nom];

      if (!images || images.length === 0) {
        console.log(`⊘ ${category.nom}: Aucune image à migrer`);
        continue;
      }

      // Vérifier si des images existent déjà pour cette catégorie
      const { data: existingImages, error: checkError } = await supabase
        .from('category_carousel_images')
        .select('id')
        .eq('category_id', category.id);

      if (checkError) {
        console.error(`✗ Erreur lors de la vérification de ${category.nom}:`, checkError);
        continue;
      }

      if (existingImages && existingImages.length > 0) {
        console.log(`⊘ ${category.nom}: ${existingImages.length} image(s) déjà présente(s), ignorée`);
        totalSkipped += existingImages.length;
        continue;
      }

      // Insérer les images
      const imagesToInsert = images.map((imageUrl, index) => ({
        category_id: category.id,
        image_url: imageUrl,
        position: index
      }));

      const { data: inserted, error: insertError } = await supabase
        .from('category_carousel_images')
        .insert(imagesToInsert)
        .select();

      if (insertError) {
        console.error(`✗ Erreur lors de l'insertion pour ${category.nom}:`, insertError);
        continue;
      }

      console.log(`✓ ${category.nom}: ${inserted.length} image(s) migrée(s)`);
      totalMigrated += inserted.length;
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Migration terminée !`);
    console.log(`   Images migrées: ${totalMigrated}`);
    console.log(`   Images ignorées (déjà présentes): ${totalSkipped}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    process.exit(1);
  }
}

migrateImages();
