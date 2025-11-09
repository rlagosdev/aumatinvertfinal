import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStorageLimits() {
  console.log('🔍 Vérification des limites de stockage Supabase...\n');

  try {
    // Lister tous les fichiers du bucket
    const { data: files, error } = await supabase.storage
      .from('images-produits')
      .list('videos', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('❌ Erreur:', error.message);
      return;
    }

    console.log('📁 Fichiers dans le dossier videos:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let totalSize = 0;

    if (files && files.length > 0) {
      files.forEach((file, idx) => {
        const sizeMB = (file.metadata?.size / (1024 * 1024)).toFixed(2);
        totalSize += file.metadata?.size || 0;
        console.log(`${idx + 1}. ${file.name}`);
        console.log(`   Taille: ${sizeMB} MB`);
        console.log(`   Date: ${new Date(file.created_at).toLocaleString()}\n`);
      });

      const totalMB = (totalSize / (1024 * 1024)).toFixed(2);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📊 Total: ${files.length} fichier(s)`);
      console.log(`💾 Espace utilisé: ${totalMB} MB`);
    } else {
      console.log('Aucun fichier vidéo trouvé dans le dossier videos/');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ℹ️  Limites Supabase (plan gratuit):');
    console.log('   • Taille max par fichier: 50 MB');
    console.log('   • Stockage total: 1 GB');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    console.log('\n💡 Recommandations:');
    console.log('   • Compressez vos vidéos avant upload');
    console.log('   • Utilisez des services externes (YouTube, Vimeo) pour les grandes vidéos');
    console.log('   • Format recommandé: MP4 (H.264) pour une meilleure compatibilité');

  } catch (error) {
    console.error('💥 Erreur fatale:', error);
  }
}

checkStorageLimits().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
