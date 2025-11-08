const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = path.join(__dirname, '../public/logo-source.jpg');
const outputDir = path.join(__dirname, '../public');

// Tailles d'icônes requises pour la PWA
const sizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

async function generateIcons() {
  console.log('🎨 Génération des icônes PWA...\n');

  for (const { size, name } of sizes) {
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(path.join(outputDir, name));

      console.log(`✅ ${name} (${size}x${size}) créée`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création de ${name}:`, error.message);
    }
  }

  // Générer aussi apple-touch-icon.png
  try {
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));

    console.log('✅ apple-touch-icon.png (180x180) créée');
  } catch (error) {
    console.error('❌ Erreur lors de la création de apple-touch-icon.png:', error.message);
  }

  // Générer favicon.ico (32x32)
  try {
    await sharp(sourceImage)
      .resize(32, 32, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));

    console.log('✅ favicon.png (32x32) créée');
  } catch (error) {
    console.error('❌ Erreur lors de la création de favicon.png:', error.message);
  }

  console.log('\n🎉 Génération terminée !');
}

generateIcons();
