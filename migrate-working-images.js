import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDEwMDU0NywiZXhwIjoyMDc1Njc2NTQ3fQ.pj3F4xY9b3mSzWPgMJIU_Avg80CJtP7nVjc3Q8pwzSg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Créer un dossier temporaire pour les téléchargements
const tempDir = './temp-images';
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Fonction pour nettoyer un nom de fichier
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9]/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/-+/g, '-') // Fusionner les tirets multiples
    .replace(/^-|-$/g, ''); // Enlever les tirets au début/fin
}

// Fonction pour télécharger une image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Suivre la redirection
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filepath);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Download timeout'));
    });
  });
}

async function migrateImages() {
  console.log('🚀 Migration des images (SANS ibb.co) vers Supabase Storage...\n');

  // Charger le rapport
  const report = JSON.parse(fs.readFileSync('external-images-report.json', 'utf8'));

  // Filtrer pour exclure ibb.co
  const images = report.images.filter(img => !img.url.includes('i.ibb.co'));

  console.log(`📊 Images à migrer: ${images.length} (ibb.co exclu)\n`);

  let success = 0;
  let failed = 0;
  const results = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`\n[${i + 1}/${images.length}] Migration: ${img.name}`);
    console.log(`   Table: ${img.table}`);
    console.log(`   Source: ${img.url}`);

    try {
      // Générer un nom de fichier propre
      const baseName = sanitizeFilename(img.name);
      const ext = path.extname(new URL(img.url).pathname) || '.jpg';
      const filename = `${baseName}${ext}`;
      const localPath = path.join(tempDir, filename);

      // Télécharger l'image
      console.log(`   📥 Téléchargement...`);
      await downloadImage(img.url, localPath);

      // Lire le fichier
      const fileBuffer = fs.readFileSync(localPath);
      const fileSize = (fileBuffer.length / 1024).toFixed(2);
      console.log(`   📦 Taille: ${fileSize} KB`);

      // Déterminer le chemin dans le bucket selon le type
      let storagePath;
      if (img.table === 'products') {
        storagePath = `produits/${filename}`;
      } else if (img.table === 'categories') {
        storagePath = `categories/${filename}`;
      } else if (img.table === 'evenements_config') {
        storagePath = `evenements/${filename}`;
      } else if (img.table === 'site_settings') {
        if (img.name.includes('carousel')) {
          storagePath = `carousel/${filename}`;
        } else if (img.name.includes('about')) {
          storagePath = `about/${filename}`;
        } else if (img.name.includes('logo')) {
          storagePath = `logo/${filename}`;
        } else if (img.name.includes('annonce')) {
          storagePath = `annonces/${filename}`;
        } else if (img.name.includes('service')) {
          storagePath = `services/${filename}`;
        } else {
          storagePath = `settings/${filename}`;
        }
      } else {
        storagePath = `other/${filename}`;
      }

      // Uploader vers Supabase Storage
      console.log(`   ⬆️  Upload vers: ${storagePath}`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images-produits')
        .upload(storagePath, fileBuffer, {
          contentType: ext === '.png' ? 'image/png' : 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('images-produits')
        .getPublicUrl(storagePath);

      const newUrl = urlData.publicUrl;
      console.log(`   ✅ Nouvelle URL: ${newUrl}`);

      // Mettre à jour la base de données
      console.log(`   💾 Mise à jour de la base de données...`);
      const { error: updateError } = await supabase
        .from(img.table)
        .update({ [img.field]: newUrl })
        .eq('id', img.id);

      if (updateError) {
        throw updateError;
      }

      // Supprimer le fichier temporaire
      fs.unlinkSync(localPath);

      success++;
      results.push({
        ...img,
        status: 'success',
        newUrl,
        storagePath
      });

      console.log(`   ✅ Migration réussie!`);

    } catch (error) {
      console.error(`   ❌ Erreur: ${error.message}`);
      failed++;
      results.push({
        ...img,
        status: 'failed',
        error: error.message
      });
    }

    // Petite pause pour éviter de surcharger
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RÉSUMÉ DE LA MIGRATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Réussies: ${success}/${images.length}`);
  console.log(`❌ Échouées: ${failed}/${images.length}`);
  console.log(`📈 Taux de réussite: ${((success / images.length) * 100).toFixed(1)}%`);

  // Sauvegarder le rapport de migration
  fs.writeFileSync(
    'migration-working-report.json',
    JSON.stringify({
      date: new Date().toISOString(),
      total: images.length,
      success,
      failed,
      results
    }, null, 2)
  );

  console.log('\n💾 Rapport de migration sauvegardé: migration-working-report.json');
  console.log('\n⚠️  Note: Les images ibb.co ont été exclues (nécessitent un téléchargement manuel)');

  // Nettoyer le dossier temporaire
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

migrateImages().then(() => {
  console.log('\n✨ Migration terminée!');
  process.exit(0);
}).catch(err => {
  console.error('💥 Erreur fatale:', err);
  process.exit(1);
});
