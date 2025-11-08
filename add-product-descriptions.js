import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const supabaseUrl = 'https://bvvekjhvmorgdvleobdo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2dmVramh2bW9yZ2R2bGVvYmRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMDA1NDcsImV4cCI6MjA3NTY3NjU0N30.HoR5ektpKVy4nudbUvGBdWDyKsHqHy1u7Yw1CPVJ-eM';
const supabase = createClient(supabaseUrl, supabaseKey);

// Descriptions pour différents types de produits
const descriptions = {
  // Fromages
  fromages: [
    "Fromage artisanal de nos producteurs locaux, affiné avec soin pour développer des arômes authentiques. Parfait pour vos plateaux ou à déguster simplement avec du pain frais.",
    "Savoureux fromage de caractère, sélectionné auprès de nos producteurs régionaux. Une texture onctueuse et un goût incomparable qui ravira les amateurs.",
    "Fromage fermier de qualité supérieure, fabriqué selon des méthodes traditionnelles. Idéal pour accompagner vos repas ou composer de délicieux plateaux.",
  ],

  // Charcuterie
  charcuterie: [
    "Charcuterie artisanale préparée selon les méthodes traditionnelles. Sans conservateurs artificiels, elle offre une qualité et une saveur exceptionnelles.",
    "Produit de charcuterie fine sélectionné chez nos artisans locaux. Parfait pour vos apéritifs, sandwichs ou plateaux gourmands.",
    "Délicieuse charcuterie artisanale aux saveurs authentiques. Idéale pour agrémenter vos repas ou créer de généreux plateaux de dégustation.",
  ],

  // Vins
  vins: [
    "Vin de qualité sélectionné auprès de vignerons passionnés. Un assemblage harmonieux qui accompagnera parfaitement vos repas et moments conviviaux.",
    "Cuvée artisanale issue de vignobles respectueux de l'environnement. Des arômes riches et une belle structure pour sublimer vos plats.",
    "Vin de caractère produit dans le respect du terroir. Une sélection soignée pour les amateurs de bons crus et de découvertes gustatives.",
  ],

  // Chocolats
  chocolats: [
    "Chocolat artisanal aux saveurs raffinées, élaboré avec des fèves de cacao soigneusement sélectionnées. Un moment de pur plaisir à savourer.",
    "Création chocolatée d'exception, fabriquée par nos chocolatiers partenaires. Texture fondante et arômes subtils pour les gourmands exigeants.",
    "Chocolat fin de haute qualité, parfait pour offrir ou se faire plaisir. Une explosion de saveurs qui ravira les palais les plus délicats.",
  ],

  // Paniers et plateaux
  paniers: [
    "Composition gourmande rassemblant nos meilleurs produits locaux. Idéal pour partager un moment convivial en famille ou entre amis.",
    "Sélection généreuse de produits artisanaux de notre région. Parfait pour découvrir la richesse de notre terroir ou pour offrir.",
    "Assortiment soigné de spécialités régionales, préparé avec soin. Une belle façon de profiter du meilleur de nos producteurs locaux.",
  ],

  // Fruits et légumes
  fruits_legumes: [
    "Produit frais de saison, cultivé par nos maraîchers locaux. Cueilli à maturité pour vous garantir saveur et qualité optimales.",
    "Légume/fruit de qualité, issu de l'agriculture raisonnée. Savoureux et nutritif, parfait pour des recettes saines et gourmandes.",
    "Produit du terroir, fraîchement récolté et sélectionné pour vous. Goût authentique et fraîcheur garantie pour cuisiner avec plaisir.",
  ],

  // Épicerie fine
  epicerie: [
    "Produit d'épicerie fine sélectionné avec soin auprès d'artisans passionnés. Qualité supérieure pour sublimer vos préparations culinaires.",
    "Spécialité artisanale de notre terroir, élaborée selon des recettes traditionnelles. Un ingrédient d'exception pour vos créations gourmandes.",
    "Produit du terroir de qualité premium, parfait pour agrémenter vos plats. Une touche d'authenticité dans votre cuisine quotidienne.",
  ],

  // Boulangerie/Pâtisserie
  boulangerie: [
    "Produit artisanal préparé chaque jour avec des ingrédients de qualité. Fraîcheur et savoir-faire pour le plaisir de vos papilles.",
    "Spécialité boulangère confectionnée selon les méthodes traditionnelles. Texture moelleuse et saveur authentique garanties.",
    "Création gourmande réalisée par nos artisans boulangers. Le goût du fait maison pour vos petits-déjeuners et goûters.",
  ],

  // Boissons
  boissons: [
    "Boisson artisanale élaborée avec des ingrédients naturels et locaux. Rafraîchissante et savoureuse pour tous vos moments de convivialité.",
    "Produit de qualité sélectionné pour son authenticité et son goût. Parfait pour accompagner vos repas ou désaltérer avec plaisir.",
    "Boisson artisanale aux saveurs naturelles, sans additifs artificiels. Une option saine et délicieuse pour toute la famille.",
  ],

  // Produits de la mer
  mer: [
    "Produit de la mer frais, sélectionné auprès de pêcheurs locaux. Qualité et fraîcheur garanties pour des recettes savoureuses.",
    "Spécialité marine de première qualité, travaillée avec soin. Saveurs iodées et texture délicate pour les amateurs de produits de la mer.",
    "Produit de la pêche locale, traité dans le respect des traditions. Fraîcheur incomparable pour vos plats de poisson et fruits de mer.",
  ],

  // Viandes
  viandes: [
    "Viande de qualité supérieure, provenant d'élevages locaux respectueux du bien-être animal. Tendreté et saveur pour vos meilleurs plats.",
    "Produit carné sélectionné auprès d'éleveurs partenaires. Viande goûteuse et de première qualité pour régaler toute la famille.",
    "Viande fermière issue d'élevages traditionnels de notre région. Qualité exceptionnelle et traçabilité garantie de la ferme à l'assiette.",
  ],

  // Produits laitiers
  laitiers: [
    "Produit laitier artisanal, élaboré à partir de lait de nos fermes partenaires. Onctuosité et goût authentique pour votre plaisir quotidien.",
    "Spécialité laitière de qualité, fabriquée selon des méthodes traditionnelles. Texture crémeuse et saveur délicate garanties.",
    "Produit laitier fermier, préparé avec soin et passion. Le goût du vrai lait pour des moments gourmands en famille.",
  ],

  // Default
  default: [
    "Produit artisanal de qualité supérieure, sélectionné auprès de nos producteurs locaux. Une spécialité régionale à découvrir absolument.",
    "Spécialité locale élaborée avec passion et savoir-faire. Goût authentique et qualité garantie pour des moments gourmands.",
    "Produit du terroir soigneusement choisi pour vous offrir le meilleur de notre région. Qualité et authenticité au rendez-vous.",
  ]
};

// Fonction pour détecter la catégorie du produit
function getCategoryKey(categoryName) {
  const cat = categoryName.toLowerCase();

  if (cat.includes('fromage')) return 'fromages';
  if (cat.includes('charcuterie') || cat.includes('saucisse') || cat.includes('jambon')) return 'charcuterie';
  if (cat.includes('vin') || cat.includes('alcool')) return 'vins';
  if (cat.includes('chocolat') || cat.includes('confiserie')) return 'chocolats';
  if (cat.includes('panier') || cat.includes('plateau') || cat.includes('coffret')) return 'paniers';
  if (cat.includes('fruit') || cat.includes('légume') || cat.includes('legume')) return 'fruits_legumes';
  if (cat.includes('épicerie') || cat.includes('epicerie') || cat.includes('condiment')) return 'epicerie';
  if (cat.includes('pain') || cat.includes('boulangerie') || cat.includes('pâtisserie') || cat.includes('patisserie')) return 'boulangerie';
  if (cat.includes('boisson') || cat.includes('jus') || cat.includes('soda')) return 'boissons';
  if (cat.includes('poisson') || cat.includes('mer') || cat.includes('fruits de mer')) return 'mer';
  if (cat.includes('viande') || cat.includes('bœuf') || cat.includes('boeuf') || cat.includes('porc') || cat.includes('volaille')) return 'viandes';
  if (cat.includes('lait') || cat.includes('yaourt') || cat.includes('crème') || cat.includes('beurre')) return 'laitiers';

  return 'default';
}

// Fonction pour obtenir une description aléatoire selon la catégorie
function getRandomDescription(categoryName) {
  const categoryKey = getCategoryKey(categoryName);
  const categoryDescriptions = descriptions[categoryKey] || descriptions.default;
  const randomIndex = Math.floor(Math.random() * categoryDescriptions.length);
  return categoryDescriptions[randomIndex];
}

// Fonction principale pour mettre à jour les produits
async function addDescriptionsToProducts() {
  try {
    console.log('🔍 Récupération des produits sans description...');

    // Récupérer tous les produits sans description ou avec description vide
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, nom, categorie, description')
      .or('description.is.null,description.eq.');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des produits:', fetchError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('✅ Tous les produits ont déjà une description !');
      return;
    }

    console.log(`📝 ${products.length} produits trouvés sans description`);
    console.log('');

    // Mettre à jour chaque produit
    let successCount = 0;
    let errorCount = 0;

    for (const product of products) {
      const description = getRandomDescription(product.categorie);

      const { error: updateError } = await supabase
        .from('products')
        .update({ description })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Erreur pour "${product.nom}":`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ "${product.nom}" (${product.categorie})`);
        console.log(`   → ${description.substring(0, 80)}...`);
        console.log('');
        successCount++;
      }
    }

    console.log('');
    console.log('====================================');
    console.log(`✅ ${successCount} produits mis à jour avec succès`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }
    console.log('====================================');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécution du script
console.log('');
console.log('====================================');
console.log('🚀 Script d\'ajout de descriptions');
console.log('====================================');
console.log('');

addDescriptionsToProducts();
