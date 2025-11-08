import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hpksvqtxdzdsofcxynfg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa3N2cXR4ZHpkc29mY3h5bmZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTU1NTIsImV4cCI6MjA2MzIzMTU1Mn0.aWMn4BzIrCJN9S-2KQ3x_N5gzN4Z4z7MQ_zLIJOF0ic';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkWeightPricing() {
  console.log('🔍 Checking weight pricing configuration...\n');

  // Get all products with their weight pricing status
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, nom, vendu_au_poids, prix_par_100g, prix')
    .order('nom');

  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    return;
  }

  console.log(`📦 Found ${products.length} products\n`);

  // Check each product for weight pricing
  for (const product of products) {
    if (product.nom.toLowerCase().includes('asperges') || product.vendu_au_poids) {
      console.log(`\n📋 Product: ${product.nom}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   vendu_au_poids: ${product.vendu_au_poids}`);
      console.log(`   prix_par_100g: ${product.prix_par_100g}`);
      console.log(`   prix: ${product.prix}`);

      // Get weight tiers for this product
      const { data: tiers, error: tiersError } = await supabase
        .from('product_weight_tiers')
        .select('*')
        .eq('product_id', product.id)
        .order('tier_order');

      if (tiersError) {
        console.error(`   ❌ Error fetching tiers:`, tiersError);
      } else if (tiers && tiers.length > 0) {
        console.log(`   ✅ Weight tiers (${tiers.length}):`);
        tiers.forEach((tier, idx) => {
          console.log(`      ${idx + 1}. ${tier.poids_grammes}g = ${tier.prix}€ (order: ${tier.tier_order})`);
        });
      } else {
        console.log(`   ⚠️  No weight tiers found`);
      }
    }
  }

  console.log('\n✅ Check complete!');
}

checkWeightPricing().catch(console.error);
