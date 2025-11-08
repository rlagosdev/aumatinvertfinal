-- Script SQL pour ajouter les descriptions aux produits
-- À exécuter dans l'éditeur SQL de Supabase

-- Alternatives café
UPDATE products SET description = 'Alternative au café avec caféine naturelle, élaborée à partir d''ingrédients biologiques soigneusement sélectionnés. Une boisson énergisante et savoureuse pour bien démarrer la journée.' WHERE nom = 'Tonique - Alternative Café avec CAFÉINE';

UPDATE products SET description = 'Alternative au café sans caféine, parfaite pour profiter du goût authentique du café à tout moment de la journée. Idéale pour les personnes sensibles à la caféine.' WHERE nom = 'Classique - Alternative Café SANS CAFÉINE';

-- Jus & boissons
UPDATE products SET description = 'Concentré de gingembre artisanal aux propriétés stimulantes et digestives. À diluer dans de l''eau chaude ou froide pour une boisson rafraîchissante et tonifiante.' WHERE nom = 'Concentré de Gingembre';

UPDATE products SET description = 'Pur jus de pommes pressées à froid, sans sucres ajoutés. Produit par nos arboriculteurs locaux, il offre une saveur naturellement sucrée et désaltérante.' WHERE nom = 'Jus de Pommes';

UPDATE products SET description = 'Jus de poires fraîchement pressées, doux et parfumé. Sans additifs ni conservateurs, ce nectar naturel ravira les amateurs de saveurs délicates.' WHERE nom = 'Jus de Poires';

UPDATE products SET description = 'Jus de raisin naturellement pétillant, légèrement effervescent et désaltérant. Une alternative festive aux sodas, sans alcool et sans sucres ajoutés.' WHERE nom = 'Jus de Raisin Pétillant';

UPDATE products SET description = 'Jus de pomme pétillant naturel, léger et rafraîchissant. Parfait pour accompagner vos repas ou pour un moment de détente pétillant.' WHERE nom = 'Pétillant Pomme';

-- Confitures
UPDATE products SET description = 'Confiture artisanale de physalis biologiques, aussi appelés amour-en-cage. Un goût exotique et acidulé pour vos tartines et desserts gourmands.' WHERE nom = 'Confiture de Physalis BIO';

-- Conserves de poisson
UPDATE products SET description = 'Rillettes artisanales de saumon fumé bio, sublimées par une touche de muscadet. Texture onctueuse et saveurs raffinées pour vos apéritifs.' WHERE nom = 'Rillettes de saumon fumé BIO au muscadet BIO';

UPDATE products SET description = 'Rillettes de thon bio enrichies de graines de sésame grillées. Un mélange savoureux aux notes asiatiques pour vos tartines et toasts.' WHERE nom = 'Rillettes de thon aux graines de sésame grillées BIO';

UPDATE products SET description = 'Rillettes de truite fumée bio, relevées par les baies de Timur aux notes citronnées et poivrées. Une création originale et raffinée.' WHERE nom = 'Rillettes de truite fumée BIO aux baies de Timur BIO';

UPDATE products SET description = 'Sardines préparées à la nantaise, selon une recette traditionnelle locale. En conserve pour une conservation optimale.' WHERE nom = 'Sardines à la Nantaise';

-- Biscuits
UPDATE products SET description = 'Sablés gourmands parfumés à la framboise, préparés artisanalement. Texture fondante et saveur fruitée pour un goûter délicieux.' WHERE nom = 'Sablés Framboise';

UPDATE products SET description = 'Sablés nature au beurre, préparés selon une recette traditionnelle. Idéals pour le goûter ou à accompagner de confiture.' WHERE nom = 'Sablés Nature';

UPDATE products SET description = 'Sablés au caramel au beurre salé, un classique breton revisité. Fondants et gourmands pour accompagner le thé ou le café.' WHERE nom LIKE 'Sablés caramel au beurre salé%';

-- Biscuits apéritifs
UPDATE products SET description = 'Sablés apéritifs aux herbes de Provence et à l''ail, parfaits pour accompagner vos moments conviviaux. Croquants et savoureux.' WHERE nom = 'Sablés Herbes de Provence & Ail';

UPDATE products SET description = 'Sablés apéritifs au parmesan et graines de pavot, pour des apéros gourmands. Texture croustillante et goût fromager prononcé.' WHERE nom = 'Sablés Parmesan & Pavot';

UPDATE products SET description = 'Sablés apéritifs aux tomates séchées et aux noix, pour des saveurs méditerranéennes. Parfaits pour un apéro gourmand.' WHERE nom = 'Sablés Tomates Séchées & Noix';

-- Conserves de légumes
UPDATE products SET description = 'Soupe de poireaux biologiques, préparée artisanalement. Onctueuse et réconfortante, elle se réchauffe en quelques minutes.' WHERE nom = 'Soupe de Poireau BIO';

UPDATE products SET description = 'Asperges blanches biologiques en conserve, tendres et délicates. Prêtes à déguster chaudes ou froides avec vos sauces préférées.' WHERE nom = 'Asperges Blanches BIO';

-- Produits laitiers
UPDATE products SET description = 'Fromage artisanal bio à pâte molle, fabriqué localement. Crémeux et savoureux, parfait pour vos plateaux de fromages.' WHERE nom = 'Le Roume BIO PIÈCE';
