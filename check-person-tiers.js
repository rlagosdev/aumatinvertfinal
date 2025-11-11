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

async function checkPersonPriceTiers() {
  console.log('🔍 Vérification de la table person_price_tiers...\n');

  try {
    // Test 1: Vérifier si la table existe
    console.log('1️⃣ Test de connexion à la table...');
    const { data: testData, error: testError } = await supabase
      .from('person_price_tiers')
      .select('*')
      .limit(1);

    if (testError) {
      if (testError.code === '42P01') {
        console.error('❌ La table person_price_tiers n\'existe pas !');
        console.log('\n📝 Vous devez créer la table avec ce SQL dans Supabase:');
        console.log(`
CREATE TABLE person_price_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  min_persons INTEGER NOT NULL CHECK (min_persons > 0),
  max_persons INTEGER CHECK (max_persons IS NULL OR max_persons >= min_persons),
  price_per_person DECIMAL(10, 2) NOT NULL CHECK (price_per_person >= 0),
  tier_order INTEGER NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')) DEFAULT 'fixed',
  discount_percentage DECIMAL(5, 2) CHECK (discount_percentage IS NULL OR (discount_percentage > 0 AND discount_percentage <= 100)),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_person_price_tiers_product_id ON person_price_tiers(product_id);
CREATE INDEX idx_person_price_tiers_tier_order ON person_price_tiers(product_id, tier_order);
        `);
        return;
      } else {
        throw testError;
      }
    }

    console.log('✅ La table existe\n');

    // Test 2: Lister tous les tarifs dégressifs
    console.log('2️⃣ Liste des tarifs dégressifs enregistrés:');
    const { data: allTiers, error: allError } = await supabase
      .from('person_price_tiers')
      .select('*')
      .order('product_id')
      .order('tier_order');

    if (allError) throw allError;

    if (!allTiers || allTiers.length === 0) {
      console.log('⚠️  Aucun tarif dégressif trouvé dans la base de données\n');
    } else {
      console.log(`✅ ${allTiers.length} tarif(s) trouvé(s):\n`);

      // Grouper par produit
      const byProduct = allTiers.reduce((acc, tier) => {
        if (!acc[tier.product_id]) acc[tier.product_id] = [];
        acc[tier.product_id].push(tier);
        return acc;
      }, {});

      for (const [productId, tiers] of Object.entries(byProduct)) {
        console.log(`📦 Produit ID: ${productId}`);
        tiers.forEach((tier, i) => {
          const maxText = tier.max_persons ? tier.max_persons : '∞';
          if (tier.discount_type === 'percentage') {
            console.log(`   ${i + 1}. ${tier.min_persons}-${maxText} personnes → -${tier.discount_percentage}% (Type: pourcentage)`);
          } else {
            console.log(`   ${i + 1}. ${tier.min_persons}-${maxText} personnes → ${tier.price_per_person}€/pers`);
          }
        });
        console.log('');
      }
    }

    // Test 3: Vérifier les produits avec prix par personne
    console.log('3️⃣ Vérification des produits avec "Prix par personne" activé:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, nom, prix_par_personne, prix_unitaire_personne')
      .eq('prix_par_personne', true);

    if (productsError) throw productsError;

    if (!products || products.length === 0) {
      console.log('⚠️  Aucun produit avec "Prix par personne" activé\n');
    } else {
      console.log(`✅ ${products.length} produit(s) avec tarification par personne:\n`);

      for (const product of products) {
        const { data: tierCount } = await supabase
          .from('person_price_tiers')
          .select('id', { count: 'exact' })
          .eq('product_id', product.id);

        console.log(`📦 ${product.nom} (ID: ${product.id})`);
        console.log(`   Prix de base: ${product.prix_unitaire_personne}€/pers`);
        console.log(`   Paliers configurés: ${tierCount?.length || 0}`);
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error);
  }
}

checkPersonPriceTiers();
