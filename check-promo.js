import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kiypafiumpuaqhnelgjr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpeXBhZml1bXB1YXFobmVsZ2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU1NTcyMDEsImV4cCI6MjA1MTEzMzIwMX0.QlYYEGJR7N4nj15BgCGBWz1a-7YM1h3AQZyZ6U1a6HU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPromo() {
  console.log('\n=== Vérification du code promo WINTER2026 ===\n');

  // 1. Récupérer le code promo
  const { data: promo, error: promoError } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', 'WINTER2026')
    .single();

  if (promoError) {
    console.error('❌ Erreur lors de la récupération du promo:', promoError);
    return;
  }

  console.log('✅ Code promo trouvé:');
  console.log(JSON.stringify(promo, null, 2));

  // 2. Récupérer le produit "Cornets de fromages min 4"
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, nom, use_price_tiers')
    .ilike('nom', '%Cornets de fromages%')
    .single();

  if (productError) {
    console.error('❌ Erreur produit:', productError);
    return;
  }

  console.log('\n✅ Produit trouvé:');
  console.log(JSON.stringify(product, null, 2));

  // 3. Récupérer les paliers de prix du produit
  const { data: tiers, error: tiersError } = await supabase
    .from('product_price_tiers')
    .select('*')
    .eq('product_id', product.id)
    .order('quantity');

  if (tiersError) {
    console.error('❌ Erreur paliers:', tiersError);
    return;
  }

  console.log('\n✅ Paliers de prix trouvés:');
  console.log(JSON.stringify(tiers, null, 2));

  // 4. Vérifier la correspondance
  console.log('\n=== Analyse ===');
  console.log('Code promo config:');
  console.log(`  - product_id: ${promo.product_id}`);
  console.log(`  - pricing_type: ${promo.pricing_type}`);
  console.log(`  - pricing_item_id: ${promo.pricing_item_id}`);

  const palier6 = tiers.find(t => t.quantity === 6);
  console.log('\nPalier "6 personnes":');
  console.log(`  - id: ${palier6?.id}`);
  console.log(`  - quantity: ${palier6?.quantity}`);
  console.log(`  - price: ${palier6?.price}`);

  if (promo.pricing_item_id === palier6?.id) {
    console.log('\n✅ Le code promo est bien configuré pour le palier "6 personnes"');
  } else {
    console.log('\n❌ PROBLÈME: Le pricing_item_id du promo ne correspond pas au palier "6 personnes"');
    console.log(`   Attendu: ${palier6?.id}`);
    console.log(`   Actuel: ${promo.pricing_item_id}`);
  }
}

checkPromo().then(() => {
  console.log('\n=== Fin de la vérification ===\n');
  process.exit(0);
}).catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
