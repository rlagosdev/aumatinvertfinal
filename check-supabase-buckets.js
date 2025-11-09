import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBuckets() {
  console.log('🔍 Vérification des buckets Supabase Storage...\n');

  try {
    // Lister tous les buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('❌ Erreur:', error);
      return;
    }

    console.log('📦 Buckets disponibles:\n');
    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name}`);
      console.log(`   - ID: ${bucket.id}`);
      console.log(`   - Public: ${bucket.public}`);
      console.log(`   - Créé: ${bucket.created_at}`);
      console.log('');
    });

    // Pour chaque bucket, lister les fichiers
    for (const bucket of buckets) {
      console.log(`\n📁 Contenu du bucket "${bucket.name}":`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      const { data: files, error: filesError } = await supabase.storage
        .from(bucket.name)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (filesError) {
        console.error(`   ❌ Erreur: ${filesError.message}`);
        continue;
      }

      if (!files || files.length === 0) {
        console.log('   (vide)');
        continue;
      }

      files.forEach(file => {
        const icon = file.id ? '📄' : '📁';
        const size = file.metadata?.size ? `(${(file.metadata.size / 1024).toFixed(2)} KB)` : '';
        console.log(`   ${icon} ${file.name} ${size}`);
      });
    }

  } catch (error) {
    console.error('💥 Erreur:', error);
  }
}

checkBuckets().then(() => {
  console.log('\n✨ Terminé!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur:', err);
  process.exit(1);
});
