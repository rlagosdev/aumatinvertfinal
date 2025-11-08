import React from 'react';
import { FileText, Target, Image, MessageSquare, Star, Clock, MapPin, Phone } from 'lucide-react';

const GmbOptimization: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="flex items-center mb-6 pb-6 border-b border-gray-200">
            <Target className="h-10 w-10 text-site-primary mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Guide d'Optimisation Google My Business</h1>
              <p className="text-gray-600 mt-1">Au Matin Vert - 8 novembre 2025</p>
            </div>
          </div>

          {/* Objectif */}
          <section className="mb-8">
            <div className="bg-site-primary/10 border-l-4 border-site-primary p-4 rounded">
              <h2 className="text-xl font-bold text-gray-900 mb-2">🎯 Objectif</h2>
              <p className="text-gray-700">
                Optimiser la fiche Google My Business avec les mots-clés les plus recherchés pour améliorer
                le référencement local et attirer plus de clients.
              </p>
            </div>
          </section>

          {/* 1. Description */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-site-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">1. Description de l'établissement</h2>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Description actuelle :</p>
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-gray-700 italic">
                  "Magasin de fruits et légumes. La priorité est donnée à la qualité et à la proximité
                  des producteurs, produits bio quand c'est possible..."
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg">
              <p className="text-sm font-bold text-green-800 mb-3">⭐ NOUVELLE DESCRIPTION OPTIMISÉE (copier-coller) :</p>
              <div className="bg-white p-4 rounded border border-green-200">
                <p className="font-bold text-lg mb-2">Épicerie bio à Saint-Herblain | Fruits et légumes bio à proximité</p>

                <p className="mb-3">Au Matin Vert, votre épicerie bio de quartier au Centre Commercial des Thébaudières depuis plus de 20 ans.</p>

                <p className="font-semibold mb-2">🌿 Nos produits :</p>
                <ul className="list-disc ml-6 mb-3 space-y-1">
                  <li>Fruits et légumes bio et locaux</li>
                  <li>Fromages à la coupe (crèmerie et fromagerie)</li>
                  <li>Produits locaux du terroir</li>
                  <li>Épicerie fine bio</li>
                </ul>

                <p className="font-semibold mb-2">🚚 Services :</p>
                <ul className="list-disc ml-6 mb-3 space-y-1">
                  <li>Livraison à domicile</li>
                  <li>Produits frais quotidiens</li>
                  <li>Conseils personnalisés</li>
                  <li>Direct producteur quand c'est possible</li>
                </ul>

                <p className="mb-2">📍 Localisation : Centre Commercial des Thébaudières, 1 Rue du Nil, 44800 Saint-Herblain</p>

                <p className="text-sm text-gray-600 italic">
                  Votre magasin bio près de chez vous ! Épicerie bio autour de moi, fruits et légumes bio livrés à domicile.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Catégories */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Catégories à ajouter</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900">✅ Primeur</p>
                <p className="text-xs text-blue-700">(Déjà présente)</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">+ Épicerie bio</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">+ Magasin d'alimentation biologique</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">+ Fromagerie</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">+ Crèmerie</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="font-semibold text-green-900">+ Épicerie fine</p>
              </div>
            </div>
          </section>

          {/* 3. Attributs */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Attributs / Services à ajouter</h2>
            <p className="text-sm text-gray-600 mb-3">Dans "Infos" → "Ajouter des attributs"</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'Livraison',
                'Livraison le jour même',
                'Retrait en magasin',
                'Produits biologiques',
                'Produits locaux',
                'Parking gratuit',
                'Paiement CB',
                'Paiement sans contact'
              ].map((attr) => (
                <div key={attr} className="bg-gray-50 border border-gray-200 p-2 rounded text-sm">
                  ✅ {attr}
                </div>
              ))}
            </div>
          </section>

          {/* 4. Photos */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Image className="h-6 w-6 text-site-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">4. Photos (minimum 20)</h2>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="font-semibold mb-2">Types de photos à ajouter :</p>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>Façade du magasin (extérieur)</li>
                <li>Intérieur du magasin (rayons)</li>
                <li>Stand fruits et légumes</li>
                <li>Rayon fromages</li>
                <li>Produits bio en gros plan</li>
                <li>Équipe du magasin</li>
                <li>Livraison à domicile</li>
              </ul>
            </div>
          </section>

          {/* 5. Posts réguliers */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-site-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">5. Posts réguliers (1-2 par semaine)</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="font-semibold text-purple-900 mb-2">Exemple - Arrivage</p>
                <p className="text-sm text-gray-700">
                  🍎 Nouveaux arrivages cette semaine !<br />
                  Fruits et légumes bio frais du jour.<br />
                  Venez découvrir nos produits locaux.<br />
                  📍 Centre Commercial des Thébaudières
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="font-semibold text-purple-900 mb-2">Exemple - Fromages</p>
                <p className="text-sm text-gray-700">
                  🧀 Découvrez notre sélection de fromages à la coupe<br />
                  Produits artisanaux et bio<br />
                  Conseils personnalisés par notre équipe
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                <p className="font-semibold text-purple-900 mb-2">Exemple - Livraison</p>
                <p className="text-sm text-gray-700">
                  🚚 Livraison à domicile disponible !<br />
                  Commandez vos fruits et légumes bio en ligne<br />
                  📞 02 40 63 49 31
                </p>
              </div>
            </div>
          </section>

          {/* 6. Questions/Réponses */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Questions/Réponses anticipées</h2>
            <div className="space-y-3">
              <div className="bg-gray-50 border-l-4 border-site-primary p-4 rounded">
                <p className="font-semibold text-gray-900">Q : Proposez-vous la livraison à domicile ?</p>
                <p className="text-sm text-gray-700 mt-1">
                  R : Oui ! Nous livrons vos fruits et légumes bio à domicile. Contactez-nous au 02 40 63 49 31.
                </p>
              </div>

              <div className="bg-gray-50 border-l-4 border-site-primary p-4 rounded">
                <p className="font-semibold text-gray-900">Q : Vos produits sont-ils bio ?</p>
                <p className="text-sm text-gray-700 mt-1">
                  R : Oui, nous proposons une large gamme de fruits, légumes et produits bio. Nous privilégions les producteurs locaux.
                </p>
              </div>

              <div className="bg-gray-50 border-l-4 border-site-primary p-4 rounded">
                <p className="font-semibold text-gray-900">Q : Quels sont vos horaires ?</p>
                <p className="text-sm text-gray-700 mt-1">
                  R : Mardi-Vendredi : 8h30-12h45 et 15h30-19h | Samedi : 8h30-13h et 15h30-19h
                </p>
              </div>
            </div>
          </section>

          {/* 7. Réponses aux avis */}
          <section className="mb-8">
            <div className="flex items-center mb-4">
              <Star className="h-6 w-6 text-site-primary mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">7. Répondre aux avis</h2>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg mb-4">
              <p className="font-semibold text-orange-900 mb-2">⚠️ IMPORTANT</p>
              <p className="text-sm text-gray-700">Répondre à TOUS les avis dans les 24-48h</p>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">Modèle - Avis positif :</p>
                <p className="text-sm text-gray-700 italic">
                  Merci [Prénom] pour votre avis ! 🌿<br />
                  Nous sommes ravis que vous appréciez nos produits bio et locaux.<br />
                  À très bientôt au magasin !<br />
                  L'équipe Au Matin Vert
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="font-semibold text-red-900 mb-2">Modèle - Avis négatif :</p>
                <p className="text-sm text-gray-700 italic">
                  Bonjour [Prénom],<br />
                  Nous sommes désolés pour cette expérience.<br />
                  Contactez-nous au 02 40 63 49 31 pour en discuter.<br />
                  Nous prenons vos remarques en compte pour nous améliorer.<br />
                  Cordialement, L'équipe Au Matin Vert
                </p>
              </div>
            </div>
          </section>

          {/* Mots-clés prioritaires */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🔍 Mots-clés prioritaires</h2>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3 font-semibold">
                À utiliser dans tous vos contenus (description, posts, réponses) :
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  'épicerie bio Saint-Herblain',
                  'fruits et légumes bio à proximité',
                  'magasin bio Nantes',
                  'produits locaux 44800',
                  'épicerie bio autour de moi',
                  'fruits bio livrés à domicile',
                  'bio Thébaudières',
                  'fromagerie Saint-Herblain',
                  'primeur bio',
                  'livraison à domicile'
                ].map((keyword, idx) => (
                  <div key={idx} className="bg-white px-3 py-2 rounded text-sm border border-blue-200">
                    {idx + 1}. {keyword}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Résultats attendus */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Résultats attendus</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">✅ Avantages :</p>
                <ul className="text-sm space-y-1">
                  <li>• Meilleur positionnement local</li>
                  <li>• Plus de visibilité Google Maps</li>
                  <li>• Plus d'appels téléphoniques</li>
                  <li>• Plus de demandes d'itinéraire</li>
                  <li>• Augmentation du trafic web</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 text-blue-700 mr-2" />
                  <p className="font-semibold text-blue-900">Temps estimé :</p>
                </div>
                <ul className="text-sm space-y-1">
                  <li>• Description : 5 min</li>
                  <li>• Catégories/attributs : 10 min</li>
                  <li>• 10 photos : 15 min</li>
                  <li>• 3 posts : 15 min</li>
                  <li className="font-bold pt-2 border-t border-blue-300">TOTAL : 45 minutes</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-100 p-6 rounded-lg">
            <div className="flex items-center mb-3">
              <Phone className="h-6 w-6 text-site-primary mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Contact</h2>
            </div>
            <div className="flex items-center text-gray-700">
              <MapPin className="h-5 w-5 mr-2 text-site-primary" />
              <p className="text-sm">
                <strong>EURL AU MATIN VERT</strong><br />
                Centre Commercial des Thébaudières, 1 rue du Nil, 44800 Saint-Herblain<br />
                Tél : +33 2 40 63 49 31 | Email : contact@aumatinvert.fr<br />
                Site : <a href="https://aumatinvert.fr" className="text-site-primary hover:underline">https://aumatinvert.fr</a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Document créé le 8 novembre 2025 | Optimisations SEO basées sur Answer Socrates
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GmbOptimization;
