/**
 * Génère des icônes temporaires pour la PWA
 * avec le texte "AMV" sur fond vert
 */

const sharp = require('sharp');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = path.join(__dirname, '../public');

async function generateTempIcons() {
  console.log('🎨 Génération des icônes temporaires...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    // Créer un SVG simple avec fond vert et texte AMV
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#16a34a;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
        <text
          x="50%"
          y="55%"
          font-family="Arial, sans-serif"
          font-size="${size * 0.35}"
          font-weight="bold"
          fill="white"
          text-anchor="middle"
          dominant-baseline="middle"
        >AMV</text>
        <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="white" opacity="0.3"/>
        <circle cx="${size * 0.85}" cy="${size * 0.35}" r="${size * 0.05}" fill="white" opacity="0.3"/>
      </svg>
    `;

    try {
      await sharp(Buffer.from(svg))
        .png()
        .toFile(outputPath);

      console.log(`✅ Généré: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erreur pour icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('\n🎉 Icônes temporaires générées avec succès!');
  console.log('📁 Emplacement: public/icon-*.png');
  console.log('\n💡 Astuce: Remplace-les plus tard par ton vrai logo en suivant le GUIDE_ICONES_PWA.md');
}

generateTempIcons().catch(console.error);
