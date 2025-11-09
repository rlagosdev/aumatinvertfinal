import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findExternalImages() {
  console.log('🔍 Recherche des images externes dans la base de données...\n');

  const externalImages = [];

  try {
    // 1. Vérifier les catégories
    console.log('📂 Vérification des catégories...');
    const { data: categories } = await supabase
      .from('categories')
      .select('id, nom, image_url')
      .not('image_url', 'is', null);

    categories?.forEach(cat => {
      if (cat.image_url && (cat.image_url.startsWith('http://') || cat.image_url.startsWith('https://'))) {
        if (!cat.image_url.includes('supabase.co')) {
          externalImages.push({
            table: 'categories',
            id: cat.id,
            name: cat.nom,
            field: 'image_url',
            url: cat.image_url
          });
        }
      }
    });

    // 2. Vérifier les produits
    console.log('📦 Vérification des produits...');
    const { data: products } = await supabase
      .from('products')
      .select('id, nom, image_url')
      .not('image_url', 'is', null);

    products?.forEach(prod => {
      if (prod.image_url && (prod.image_url.startsWith('http://') || prod.image_url.startsWith('https://'))) {
        if (!prod.image_url.includes('supabase.co')) {
          externalImages.push({
            table: 'products',
            id: prod.id,
            name: prod.nom,
            field: 'image_url',
            url: prod.image_url
          });
        }
      }
    });

    // 3. Vérifier evenements_config
    console.log('🎉 Vérification de evenements_config...');
    const { data: events } = await supabase
      .from('evenements_config')
      .select('id, section_key, titre, image_url')
      .not('image_url', 'is', null);

    events?.forEach(event => {
      if (event.image_url && (event.image_url.startsWith('http://') || event.image_url.startsWith('https://'))) {
        if (!event.image_url.includes('supabase.co')) {
          externalImages.push({
            table: 'evenements_config',
            id: event.id,
            name: `${event.section_key} - ${event.titre}`,
            field: 'image_url',
            url: event.image_url
          });
        }
      }
    });

    // 4. Vérifier site_settings
    console.log('⚙️  Vérification de site_settings...');
    const { data: settings } = await supabase
      .from('site_settings')
      .select('id, setting_key, setting_value')
      .or('setting_key.like.%image%,setting_key.like.%carousel%');

    settings?.forEach(setting => {
      if (setting.setting_value && (setting.setting_value.startsWith('http://') || setting.setting_value.startsWith('https://'))) {
        if (!setting.setting_value.includes('supabase.co')) {
          externalImages.push({
            table: 'site_settings',
            id: setting.id,
            name: setting.setting_key,
            field: 'setting_value',
            url: setting.setting_value
          });
        }
      }
    });

    // 5. Vérifier product_media
    console.log('🖼️  Vérification de product_media...');
    const { data: media } = await supabase
      .from('product_media')
      .select('id, product_id, url, type')
      .not('url', 'is', null);

    media?.forEach(m => {
      if (m.url && (m.url.startsWith('http://') || m.url.startsWith('https://'))) {
        if (!m.url.includes('supabase.co')) {
          externalImages.push({
            table: 'product_media',
            id: m.id,
            name: `Product ${m.product_id} - ${m.type}`,
            field: 'url',
            url: m.url
          });
        }
      }
    });

    // Afficher les résultats
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Résumé: ${externalImages.length} images externes trouvées\n`);

    if (externalImages.length === 0) {
      console.log('✅ Aucune image externe trouvée ! Toutes les images sont déjà sur Supabase.');
      return;
    }

    // Grouper par domaine
    const byDomain = {};
    externalImages.forEach(img => {
      try {
        const domain = new URL(img.url).hostname;
        if (!byDomain[domain]) byDomain[domain] = [];
        byDomain[domain].push(img);
      } catch (e) {
        console.error('URL invalide:', img.url);
      }
    });

    console.log('📍 Images par domaine:\n');
    Object.keys(byDomain).forEach(domain => {
      console.log(`\n🌐 ${domain} (${byDomain[domain].length} images)`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      byDomain[domain].forEach((img, idx) => {
        console.log(`\n${idx + 1}. Table: ${img.table}`);
        console.log(`   Nom: ${img.name}`);
        console.log(`   URL: ${img.url}`);
      });
    });

    // Sauvegarder dans un fichier JSON
    const fs = await import('fs');
    fs.writeFileSync(
      'external-images-report.json',
      JSON.stringify({ total: externalImages.length, images: externalImages, byDomain }, null, 2)
    );
    console.log('\n\n💾 Rapport sauvegardé dans: external-images-report.json');

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

findExternalImages().then(() => {
  console.log('\n✨ Terminé!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
