import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Calculator, Package, Users, Percent, Scale, Pizza, ShoppingCart, BookOpen, Loader } from 'lucide-react';
import { supabase } from '../supabase/client';

interface Product {
  id: string;
  nom: string;
  prix: number;
  categorie: string;
  description?: string;
  use_price_tiers?: boolean;
  vendu_au_poids?: boolean;
  prix_par_personne?: boolean;
  prix_par_gamme?: boolean;
  prix_par_section?: boolean;
  prix_par_100g?: number;
  prix_unitaire_personne?: number;
}

const PricingGuide: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-site-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-800 mb-4">Produit non trouvé</p>
          <a href="/admin" className="text-site-primary hover:underline">Retour à l'administration</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
            <Calculator className="h-10 w-10 text-site-primary mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guide de Tarification</h1>
              <p className="text-xl text-site-primary mt-1 font-semibold">{product.nom}</p>
              <p className="text-gray-600 mt-1">Catégorie: {product.categorie} • Prix de base: {product.prix.toFixed(2)}€</p>
              {product.description && (
                <p className="text-sm text-gray-500 mt-2 italic">{product.description}</p>
              )}
            </div>
          </div>

          {/* Modes de tarification actifs */}
          <section className="mb-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <h2 className="text-xl font-bold text-gray-900 mb-3">✅ Modes de tarification actifs pour ce produit</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {!product.use_price_tiers && !product.vendu_au_poids && !product.prix_par_personne && !product.prix_par_gamme && !product.prix_par_section && (
                  <div className="bg-white border border-green-300 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Prix Simple uniquement</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.prix.toFixed(2)}€ par unité</p>
                  </div>
                )}
                {product.use_price_tiers && (
                  <div className="bg-white border border-green-300 p-3 rounded-lg">
                    <div className="flex items-center">
                      <ShoppingCart className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Paliers de prix</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Prix dégressifs selon la quantité</p>
                  </div>
                )}
                {product.vendu_au_poids && (
                  <div className="bg-white border border-green-300 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Scale className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Prix au poids</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.prix_par_100g?.toFixed(2)}€ / 100g</p>
                  </div>
                )}
                {product.prix_par_personne && (
                  <div className="bg-white border border-green-300 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Prix par personne</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{product.prix_unitaire_personne?.toFixed(2)}€ / personne</p>
                  </div>
                )}
                {product.prix_par_gamme && (
                  <div className="bg-white border border-green-300 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Pizza className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Prix par gamme</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Prix selon gamme + nb personnes</p>
                  </div>
                )}
                {product.prix_par_section && (
                  <div className="bg-white border border-green-300 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Pizza className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold text-green-800">Prix par section</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">1/4, 1/2, entier, etc.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Introduction */}
          <section className="mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h2 className="text-xl font-bold text-gray-900 mb-2">📚 À propos de ce guide</h2>
              <p className="text-gray-700">
                Ce guide explique tous les modes de tarification disponibles dans le système.
                Les modes actifs pour ce produit sont indiqués ci-dessus. Chaque mode répond à un besoin spécifique et peut être combiné avec des codes promo.
              </p>
            </div>
          </section>

          {/* Table des matières */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table des matières</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a href="#prix-simple" className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-site-primary mr-2" />
                  <span className="font-semibold">1. Prix Simple</span>
                </div>
              </a>
              <a href="#tarif-par-personne" className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-site-primary mr-2" />
                  <span className="font-semibold">2. Tarif par Personne</span>
                </div>
              </a>
              <a href="#remise-quantite" className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Percent className="h-5 w-5 text-site-primary mr-2" />
                  <span className="font-semibold">3. Remise par Quantité</span>
                </div>
              </a>
              <a href="#prix-au-poids" className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Scale className="h-5 w-5 text-site-primary mr-2" />
                  <span className="font-semibold">4. Prix au Poids</span>
                </div>
              </a>
              <a href="#prix-par-section" className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <Pizza className="h-5 w-5 text-site-primary mr-2" />
                  <span className="font-semibold">5. Prix par Section</span>
                </div>
              </a>
              <a href="#codes-promo" className="bg-gray-50 border border-gray-200 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-site-primary mr-2" />
                  <span className="font-semibold">6. Codes Promo</span>
                </div>
              </a>
            </div>
          </section>

          {/* 1. Prix Simple */}
          <section id="prix-simple" className="mb-12">
            <div className="flex items-center mb-4">
              <Package className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">1. Prix Simple (Unitaire)</h2>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg mb-4">
              <p className="font-semibold text-green-900 mb-2">📦 Usage :</p>
              <p className="text-gray-700">Produits vendus à l'unité avec un prix fixe.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Exemples de produits :</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Bouteille de jus de fruits : 4,50 €</li>
                  <li>Pot de confiture : 6,90 €</li>
                  <li>Paquet de pâtes : 2,80 €</li>
                  <li>Fromage emballé : 12,00 €</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⚙️ Configuration :</p>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Dans "Modifier produit", remplissez le champ <strong>"Prix (€)"</strong></p>
                  <p><strong>2.</strong> Désactivez tous les autres modes de tarification</p>
                  <p><strong>3.</strong> Cliquez sur "Modifier"</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">💰 Calcul du prix :</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-yellow-200">
                  Prix total = Prix unitaire × Quantité
                  <br />
                  <br />
                  Exemple : 4,50 € × 3 = <strong>13,50 €</strong>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Tarif par Personne */}
          <section id="tarif-par-personne" className="mb-12">
            <div className="flex items-center mb-4">
              <Users className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">2. Tarif par Personne</h2>
            </div>

            <div className="bg-purple-50 border-2 border-purple-500 p-6 rounded-lg mb-4">
              <p className="font-semibold text-purple-900 mb-2">👥 Usage :</p>
              <p className="text-gray-700">Plateaux, buffets, événements avec prix dégressif selon le nombre de personnes.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Exemples de produits :</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Plateau apéritif : 4-6 personnes = 45€, 8-10 personnes = 75€</li>
                  <li>Plateau fromages : 6-8 personnes = 35€, 10-12 personnes = 55€</li>
                  <li>Buffet traiteur : Prix par personne selon taille</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⚙️ Configuration :</p>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Activez <strong>"Tarification par personne"</strong></p>
                  <p><strong>2.</strong> Cliquez sur <strong>"Ajouter un palier"</strong></p>
                  <p><strong>3.</strong> Remplissez pour chaque palier :</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong>Nom :</strong> "4-6 personnes", "8-10 personnes"</li>
                    <li><strong>Min personnes :</strong> 4, 8</li>
                    <li><strong>Max personnes :</strong> 6, 10</li>
                    <li><strong>Prix :</strong> 45, 75</li>
                  </ul>
                  <p><strong>4.</strong> Cliquez sur "Sauvegarder les paliers", puis "Modifier"</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">💰 Calcul du prix :</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-yellow-200">
                  Prix total = Prix du palier sélectionné × Quantité de plateaux
                  <br />
                  <br />
                  Exemple : Plateau 4-6 pers (45€) × 2 plateaux = <strong>90,00 €</strong>
                </div>
              </div>

              <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
                <p className="font-semibold text-red-900 mb-2">⚠️ Important :</p>
                <p className="text-sm text-gray-700">Les paliers ne doivent PAS se chevaucher (ex: 4-6 puis 8-10, pas 4-6 puis 6-10)</p>
              </div>
            </div>
          </section>

          {/* 3. Remise par Quantité */}
          <section id="remise-quantite" className="mb-12">
            <div className="flex items-center mb-4">
              <Percent className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">3. Remise par Quantité</h2>
            </div>

            <div className="bg-orange-50 border-2 border-orange-500 p-6 rounded-lg mb-4">
              <p className="font-semibold text-orange-900 mb-2">🎯 Usage :</p>
              <p className="text-gray-700">Prix dégressif : plus on achète, moins c'est cher à l'unité.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Exemples de produits :</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Pommes : 1-5 = 2,50€/kg, 6-10 = 2,20€/kg, 11+ = 2,00€/kg</li>
                  <li>Yaourts : 1-3 pots = 1,50€, 4-6 pots = 1,30€, 7+ = 1,10€</li>
                  <li>Conserves : Prix dégressif par lot</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⚙️ Configuration :</p>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Activez <strong>"Remise par quantité"</strong></p>
                  <p><strong>2.</strong> Remplissez le <strong>prix de base</strong> (prix à l'unité sans remise)</p>
                  <p><strong>3.</strong> Cliquez sur <strong>"Ajouter un palier"</strong></p>
                  <p><strong>4.</strong> Pour chaque palier :</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong>Quantité min :</strong> 6, 11</li>
                    <li><strong>Prix :</strong> 2,20, 2,00</li>
                    <li><strong>Ordre :</strong> 1, 2 (ordre d'affichage)</li>
                  </ul>
                  <p><strong>5.</strong> Cliquez sur "Sauvegarder les paliers", puis "Modifier"</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">💰 Calcul du prix :</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-yellow-200">
                  Si quantité ≥ seuil : Prix = Prix du palier × Quantité
                  <br />
                  Sinon : Prix = Prix de base × Quantité
                  <br />
                  <br />
                  Exemple : Pommes à 2,50€/kg (base)
                  <br />
                  - 3 kg → 2,50 € × 3 = <strong>7,50 €</strong>
                  <br />
                  - 8 kg → 2,20 € × 8 = <strong>17,60 €</strong> (palier 6-10)
                </div>
              </div>
            </div>
          </section>

          {/* 4. Prix au Poids */}
          <section id="prix-au-poids" className="mb-12">
            <div className="flex items-center mb-4">
              <Scale className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">4. Prix au Poids (Paliers)</h2>
            </div>

            <div className="bg-teal-50 border-2 border-teal-500 p-6 rounded-lg mb-4">
              <p className="font-semibold text-teal-900 mb-2">⚖️ Usage :</p>
              <p className="text-gray-700">Produits vendus au poids avec plusieurs options de poids prédéfinis.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Exemples de produits :</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Fromage à la coupe : 100g = 3,50€, 200g = 6,50€, 500g = 15,00€</li>
                  <li>Charcuterie : Différents poids avec prix fixes</li>
                  <li>Fruits secs : Sachets de 100g, 250g, 500g, 1kg</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⚙️ Configuration :</p>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Activez <strong>"Vendu au poids"</strong></p>
                  <p><strong>2.</strong> Cliquez plusieurs fois sur <strong>"Ajouter un palier"</strong></p>
                  <p><strong>3.</strong> Pour chaque palier :</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong>Poids (grammes) :</strong> 100, 200, 500</li>
                    <li><strong>Prix :</strong> 3,50, 6,50, 15,00</li>
                    <li><strong>Ordre :</strong> 1, 2, 3</li>
                  </ul>
                  <p><strong>4.</strong> Cliquez sur "Sauvegarder les paliers", puis "Modifier"</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">💰 Calcul du prix :</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-yellow-200">
                  Prix total = Prix du poids sélectionné × Quantité
                  <br />
                  <br />
                  Exemple : Fromage 200g (6,50€) × 2 = <strong>13,00 €</strong>
                </div>
              </div>

              <div className="bg-red-50 border border-red-300 p-4 rounded-lg">
                <p className="font-semibold text-red-900 mb-2">⚠️ Important :</p>
                <p className="text-sm text-gray-700">
                  N'oubliez pas de cliquer sur <strong>"Sauvegarder les paliers"</strong> avant de cliquer sur "Modifier" !
                  Sinon les paliers ne seront pas enregistrés.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Prix par Section */}
          <section id="prix-par-section" className="mb-12">
            <div className="flex items-center mb-4">
              <Pizza className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">5. Prix par Section (Parts)</h2>
            </div>

            <div className="bg-pink-50 border-2 border-pink-500 p-6 rounded-lg mb-4">
              <p className="font-semibold text-pink-900 mb-2">🍕 Usage :</p>
              <p className="text-gray-700">Produits divisibles en parts/sections (fromages, gâteaux, pizzas).</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Exemples de produits :</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Fromage : 1/4 = 5€, 1/2 = 9€, Entier = 16€</li>
                  <li>Gâteau : Part = 4€, 1/2 = 15€, Entier = 28€</li>
                  <li>Tarte : 1/4, 1/2, 3/4, Entière</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⚙️ Configuration :</p>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Activez <strong>"Sections / Parts"</strong></p>
                  <p><strong>2.</strong> Utilisez le <strong>formulaire d'ajout</strong> (toujours visible)</p>
                  <p><strong>3.</strong> Pour chaque section :</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong>Nom :</strong> Tapez ou sélectionnez "1/4", "1/2", "Entier"</li>
                    <li><strong>Fraction :</strong> Tapez ou sélectionnez 0.25, 0.5, 1</li>
                    <li><strong>Prix :</strong> 5, 9, 16</li>
                    <li><strong>Ordre :</strong> 1, 2, 3</li>
                    <li><strong>Description :</strong> (optionnel)</li>
                  </ul>
                  <p><strong>4.</strong> Cliquez sur "Ajouter", puis "Modifier"</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">💰 Calcul du prix :</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-yellow-200">
                  Prix total = Prix de la section × Quantité
                  <br />
                  <br />
                  Exemple : Fromage 1/2 (9€) × 3 = <strong>27,00 €</strong>
                </div>
              </div>

              <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">💡 Astuce :</p>
                <p className="text-sm text-gray-700">
                  Les champs "Nom" et "Fraction" proposent des suggestions automatiques (1/4, 1/2, etc.).
                  Vous pouvez aussi taper vos propres valeurs !
                </p>
              </div>
            </div>
          </section>

          {/* 6. Codes Promo */}
          <section id="codes-promo" className="mb-12">
            <div className="flex items-center mb-4">
              <ShoppingCart className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">6. Codes Promo</h2>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-500 p-6 rounded-lg mb-4">
              <p className="font-semibold text-indigo-900 mb-2">🎁 Usage :</p>
              <p className="text-gray-700">Réductions applicables au panier total ou à des produits spécifiques.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-300 p-4 rounded-lg">
                <p className="font-semibold text-gray-900 mb-2">✅ Types de codes promo :</p>
                <ul className="list-disc ml-6 space-y-2 text-gray-700">
                  <li><strong>Pourcentage :</strong> -10%, -20%, -50%</li>
                  <li><strong>Montant fixe :</strong> -5€, -10€, -20€</li>
                  <li><strong>Livraison gratuite :</strong> Frais de port = 0€</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">⚙️ Configuration :</p>
                <div className="space-y-2 text-sm">
                  <p><strong>1.</strong> Allez dans <strong>Admin → Codes Promo</strong></p>
                  <p><strong>2.</strong> Cliquez sur <strong>"Créer un code promo"</strong></p>
                  <p><strong>3.</strong> Remplissez :</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li><strong>Code :</strong> NOEL2025, BIENVENUE, etc.</li>
                    <li><strong>Type :</strong> Pourcentage, Montant fixe, Livraison gratuite</li>
                    <li><strong>Valeur :</strong> 10 (pour 10%), 5 (pour 5€)</li>
                    <li><strong>Date fin :</strong> (optionnel)</li>
                    <li><strong>Nombre max :</strong> (optionnel)</li>
                    <li><strong>Montant min :</strong> (optionnel, ex: 30€)</li>
                  </ul>
                  <p><strong>4.</strong> Sauvegardez</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
                <p className="font-semibold text-yellow-900 mb-2">💰 Calcul du prix :</p>
                <div className="font-mono text-sm bg-white p-3 rounded border border-yellow-200">
                  <strong>Pourcentage :</strong>
                  <br />
                  Prix final = Sous-total - (Sous-total × Pourcentage/100)
                  <br />
                  Exemple : 50€ - (50€ × 10/100) = <strong>45,00 €</strong>
                  <br />
                  <br />
                  <strong>Montant fixe :</strong>
                  <br />
                  Prix final = Sous-total - Montant
                  <br />
                  Exemple : 50€ - 5€ = <strong>45,00 €</strong>
                </div>
              </div>

              <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">✅ Compatibilité :</p>
                <p className="text-sm text-gray-700">
                  Les codes promo fonctionnent avec <strong>TOUS les types de tarification</strong> !
                  La remise s'applique au total du panier après calcul des prix.
                </p>
              </div>
            </div>
          </section>

          {/* Résumé */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <BookOpen className="h-7 w-7 text-site-primary mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">📊 Tableau Récapitulatif</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 border-b text-left font-semibold">Type</th>
                    <th className="px-4 py-3 border-b text-left font-semibold">Usage</th>
                    <th className="px-4 py-3 border-b text-left font-semibold">Exemple</th>
                    <th className="px-4 py-3 border-b text-left font-semibold">Calcul</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Prix Simple</td>
                    <td className="px-4 py-3">Prix fixe unitaire</td>
                    <td className="px-4 py-3">Confiture 6,90€</td>
                    <td className="px-4 py-3 font-mono">Prix × Qté</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Par Personne</td>
                    <td className="px-4 py-3">Plateaux/événements</td>
                    <td className="px-4 py-3">4-6 pers = 45€</td>
                    <td className="px-4 py-3 font-mono">Palier × Qté</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Par Quantité</td>
                    <td className="px-4 py-3">Prix dégressif</td>
                    <td className="px-4 py-3">6+ = 2,20€/kg</td>
                    <td className="px-4 py-3 font-mono">Prix palier × Qté</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Au Poids</td>
                    <td className="px-4 py-3">Poids prédéfinis</td>
                    <td className="px-4 py-3">200g = 6,50€</td>
                    <td className="px-4 py-3 font-mono">Prix poids × Qté</td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Par Section</td>
                    <td className="px-4 py-3">Parts/fractions</td>
                    <td className="px-4 py-3">1/2 = 9€</td>
                    <td className="px-4 py-3 font-mono">Prix section × Qté</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">Code Promo</td>
                    <td className="px-4 py-3">Réduction panier</td>
                    <td className="px-4 py-3">-10% ou -5€</td>
                    <td className="px-4 py-3 font-mono">Total - Remise</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Conseils */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Conseils d'utilisation</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <p><strong>Un seul mode à la fois :</strong> N'activez qu'un seul type de tarification par produit (sauf codes promo qui se cumulent)</p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">⚡</span>
                <p><strong>Sauvegardez les paliers :</strong> N'oubliez pas de cliquer sur "Sauvegarder les paliers" avant "Modifier"</p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🎯</span>
                <p><strong>Testez sur le site :</strong> Vérifiez que le prix s'affiche correctement côté client après chaque modification</p>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">📱</span>
                <p><strong>Codes promo universels :</strong> Les codes promo fonctionnent avec tous les types de tarification</p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Document créé le 8 novembre 2025 | Au Matin Vert
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingGuide;
