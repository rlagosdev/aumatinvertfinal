/**
 * Script pour générer toutes les icônes PWA
 *
 * INSTRUCTIONS:
 *
 * 1. Installer sharp: npm install --save-dev sharp
 * 2. Placer ton logo dans: public/logo-source.png (minimum 512x512px)
 * 3. Exécuter: node scripts/generate-icons.js
 *
 * Ce script générera automatiquement toutes les icônes nécessaires
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceImage = path.join(__dirname, '../public/logo-source.png');
const outputDir = path.join(__dirname, '../public');

// Vérifier si sharp est installé
try {
  require.resolve('sharp');
} catch (e) {
  console.error('❌ Sharp n\'est pas installé.');
  console.log('📦 Installez-le avec: npm install --save-dev sharp');
  process.exit(1);
}

// Vérifier si l'image source existe
if (!fs.existsSync(sourceImage)) {
  console.error('❌ Image source introuvable:', sourceImage);
  console.log('📁 Veuillez placer votre logo dans: public/logo-source.png');
  console.log('   (Minimum 512x512px, fond transparent recommandé)');
  process.exit(1);
}

// Générer les icônes
async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Généré: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erreur pour icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 Toutes les icônes ont été générées avec succès!');
  console.log('📁 Emplacement: public/icon-*.png');
}

generateIcons().catch(console.error);
