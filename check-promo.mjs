import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');

  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key.trim()] = value.replace(/^['"]|['"]$/g, '');
      }
    }
  });
}

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkPromoCodes() {
  try {
    // Find the product
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, nom, use_price_tiers')
      .ilike('nom', '%Cornets de fromages%');

    if (prodError) {
      console.error('Error fetching products:', prodError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('Produit "Cornets de fromages" non trouvé');
      return;
    }

    const product = products[0];
    console.log('=== PRODUIT ===');
    console.log('Nom:', product.nom);
    console.log('ID:', product.id);
    console.log('Use Price Tiers:', product.use_price_tiers);

    // Get promo codes
    const { data: promoCodes, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('product_id', product.id);

    if (promoError) {
      console.error('Error fetching promo codes:', promoError);
      return;
    }

    console.log('\n=== CODES PROMO (' + (promoCodes ? promoCodes.length : 0) + ') ===');
    if (promoCodes && promoCodes.length > 0) {
      promoCodes.forEach(promo => {
        console.log('\nCode:', promo.code);
        console.log('  Type tarification:', promo.pricing_type);
        console.log('  Item ID:', promo.pricing_item_id);
        console.log('  Réduction:', promo.discount_percentage + '%');
        console.log('  Actif:', promo.actif);
        console.log('  Valide du:', promo.valid_from || 'N/A');
        console.log('  Valide jusqu\'au:', promo.valid_until || 'N/A');
        console.log('  Utilisations:', promo.usage_count + '/' + (promo.usage_limit || 'illimité'));
      });
    } else {
      console.log('Aucun code promo trouvé');
    }

    // Get price tiers
    const { data: tiers, error: tiersError } = await supabase
      .from('product_price_tiers')
      .select('*')
      .eq('product_id', product.id)
      .order('tier_order');

    if (tiersError) {
      console.error('Error fetching price tiers:', tiersError);
      return;
    }

    console.log('\n=== PALIERS DE PRIX (' + (tiers ? tiers.length : 0) + ') ===');
    if (tiers && tiers.length > 0) {
      tiers.forEach(tier => {
        console.log('\nPalier:', tier.quantity, 'personnes');
        console.log('  ID:', tier.id);
        console.log('  Prix normal:', tier.price + '€');
        console.log('  Ordre:', tier.tier_order);
        if (tier.promotion_active) {
          console.log('  >>> PROMOTION ACTIVE <<<');
          console.log('  Type promo:', tier.promotion_type);
          if (tier.promotion_type === 'fixed') {
            console.log('  Prix promo:', tier.promotion_price + '€');
          } else if (tier.promotion_type === 'percent') {
            console.log('  % promo:', tier.promotion_discount_percent + '%');
          }
        }
      });
    } else {
      console.log('Aucun palier de prix trouvé');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkPromoCodes().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
