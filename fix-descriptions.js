import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Descriptions spécifiques pour chaque produit
const productDescriptions = {
  "Tonique - Alternative Café avec CAFÉINE": "Alternative au café avec caféine naturelle, élaborée à partir d'ingrédients biologiques soigneusement sélectionnés. Une boisson énergisante et savoureuse pour bien démarrer la journée.",
  "Classique - Alternative Café SANS CAFÉINE": "Alternative au café sans caféine, parfaite pour profiter du goût authentique du café à tout moment de la journée. Idéale pour les personnes sensibles à la caféine.",
  "Concentré de Gingembre": "Concentré de gingembre artisanal aux propriétés stimulantes et digestives. À diluer dans de l'eau chaude ou froide pour une boisson rafraîchissante et tonifiante.",
  "Jus de Pommes": "Pur jus de pommes pressées à froid, sans sucres ajoutés. Produit par nos arboriculteurs locaux, il offre une saveur naturellement sucrée et désaltérante.",
  "Confiture de Physalis BIO": "Confiture artisanale de physalis biologiques, aussi appelés amour-en-cage. Un goût exotique et acidulé pour vos tartines et desserts gourmands.",
  "Jus de Poires": "Jus de poires fraîchement pressées, doux et parfumé. Sans additifs ni conservateurs, ce nectar naturel ravira les amateurs de saveurs délicates.",
  "Jus de Raisin Pétillant": "Jus de raisin naturellement pétillant, légèrement effervescent et désaltérant. Une alternative festive aux sodas, sans alcool et sans sucres ajoutés.",
  "Rillettes de saumon fumé BIO au muscadet BIO": "Rillettes artisanales de saumon fumé bio, sublimées par une touche de muscadet. Texture onctueuse et saveurs raffinées pour vos apéritifs.",
  "Pétillant Pomme": "Jus de pomme pétillant naturel, léger et rafraîchissant. Parfait pour accompagner vos repas ou pour un moment de détente pétillant.",
  "Sablés Framboise": "Sablés gourmands parfumés à la framboise, préparés artisanalement. Texture fondante et saveur fruitée pour un goûter délicieux.",
  "Rillettes de thon aux graines de sésame grillées BIO": "Rillettes de thon bio enrichies de graines de sésame grillées. Un mélange savoureux aux notes asiatiques pour vos tartines et toasts.",
  "Rillettes de truite fumée BIO aux baies de Timur BIO": "Rillettes de truite fumée bio, relevées par les baies de Timur aux notes citronnées et poivrées. Une création originale et raffinée.",
  "Sablés Herbes de Provence & Ail": "Sablés apéritifs aux herbes de Provence et à l'ail, parfaits pour accompagner vos moments conviviaux. Croquants et savoureux.",
  "Sablés Nature": "Sablés nature au beurre, préparés selon une recette traditionnelle. Idéals pour le goûter ou à accompagner de confiture.",
  "Sablés Parmesan & Pavot": "Sablés apéritifs au parmesan et graines de pavot, pour des apéros gourmands. Texture croustillante et goût fromager prononcé.",
  "Soupe de Poireau BIO": "Soupe de poireaux biologiques, préparée artisanalement. Onctueuse et réconfortante, elle se réchauffe en quelques minutes.",
  "Sablés Tomates Séchées & Noix": "Sablés apéritifs aux tomates séchées et aux noix, pour des saveurs méditerranéennes. Parfaits pour un apéro gourmand.",
  "Sardines à la Nantaise": "Sardines préparées à la nantaise, selon une recette traditionnelle locale. En conserve pour une conservation optimale.",
  "Asperges Blanches BIO": "Asperges blanches biologiques en conserve, tendres et délicates. Prêtes à déguster chaudes ou froides avec vos sauces préférées.",
  "Le Roume BIO PIÈCE": "Fromage artisanal bio à pâte molle, fabriqué localement. Crémeux et savoureux, parfait pour vos plateaux de fromages.",
  "Sablés caramel au beurre salé": "Sablés au caramel au beurre salé, un classique breton revisité. Fondants et gourmands pour accompagner le thé ou le café."
};

async function fixDescriptions() {
  try {
    console.log('🔧 Correction des descriptions...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const [productName, description] of Object.entries(productDescriptions)) {
      console.log(`📝 Traitement: "${productName}"...`);

      const { data, error } = await supabase
        .from('products')
        .update({ description: description })
        .eq('nom', productName)
        .select();

      if (error) {
        console.error(`  ❌ Erreur:`, error.message);
        errorCount++;
      } else if (data && data.length > 0) {
        console.log(`  ✅ Mise à jour réussie`);
        successCount++;
      } else {
        console.log(`  ⚠️  Produit non trouvé`);
        errorCount++;
      }
    }

    console.log('\n====================================');
    console.log(`✅ ${successCount} produits mis à jour`);
    console.log(`❌ ${errorCount} erreurs`);
    console.log('====================================');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

fixDescriptions();
