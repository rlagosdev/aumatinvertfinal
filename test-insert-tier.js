import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('🧪 Test d\'insertion d\'un tarif dégressif...\n');

  // Utiliser un produit existant
  const productId = '96c4f877-29ed-4c82-811f-c43d0990a45e'; // Cornets de fromages-prix par personne

  const testTier = {
    product_id: productId,
    min_persons: 1,
    max_persons: 10,
    price_per_person: 8.50,
    tier_order: 1,
    discount_type: 'fixed',
    discount_percentage: null
  };

  console.log('📝 Tentative d\'insertion:', testTier);

  try {
    const { data, error } = await supabase
      .from('person_price_tiers')
      .insert(testTier)
      .select();

    if (error) {
      console.error('\n❌ ERREUR lors de l\'insertion:');
      console.error('Code:', error.code);
      console.error('Message:', error.message);
      console.error('Détails:', error.details);
      console.error('Hint:', error.hint);

      if (error.code === '42501') {
        console.log('\n🔒 Erreur de permission ! Les politiques RLS (Row Level Security) bloquent l\'insertion.');
        console.log('\n📋 Solutions possibles:');
        console.log('1. Désactiver RLS temporairement pour tester:');
        console.log('   ALTER TABLE person_price_tiers DISABLE ROW LEVEL SECURITY;');
        console.log('\n2. Ou créer une politique permettant les insertions:');
        console.log(`
   CREATE POLICY "Allow authenticated users to insert tiers"
   ON person_price_tiers
   FOR INSERT
   TO authenticated
   WITH CHECK (true);

   CREATE POLICY "Allow authenticated users to update tiers"
   ON person_price_tiers
   FOR UPDATE
   TO authenticated
   USING (true);

   CREATE POLICY "Allow authenticated users to delete tiers"
   ON person_price_tiers
   FOR DELETE
   TO authenticated
   USING (true);

   CREATE POLICY "Allow all to read tiers"
   ON person_price_tiers
   FOR SELECT
   TO public
   USING (true);
        `);
      }

      return;
    }

    console.log('\n✅ Insertion réussie !');
    console.log('Données insérées:', data);

    // Vérifier que les données sont bien là
    const { data: checkData, error: checkError } = await supabase
      .from('person_price_tiers')
      .select('*')
      .eq('product_id', productId);

    if (checkError) {
      console.error('Erreur lors de la vérification:', checkError);
    } else {
      console.log('\n✅ Vérification - Tarifs trouvés:', checkData.length);
      console.log(checkData);
    }

    // Nettoyer (supprimer le test)
    console.log('\n🧹 Nettoyage du test...');
    const { error: deleteError } = await supabase
      .from('person_price_tiers')
      .delete()
      .eq('product_id', productId);

    if (deleteError) {
      console.error('Erreur lors du nettoyage:', deleteError);
    } else {
      console.log('✅ Test nettoyé');
    }

  } catch (error) {
    console.error('\n❌ Exception:', error);
  }
}

testInsert();
