import React from 'react';
import { Scale } from 'lucide-react';

const LegalNotice: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Scale className="h-8 w-8 text-site-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Mentions Légales</h1>
          </div>

          <p className="text-sm text-gray-600 mb-8">
            Dernière mise à jour : 8 novembre 2025
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Éditeur du site</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Raison sociale :</strong> EURL AU MATIN VERT</p>
                <p><strong>Forme juridique :</strong> Société à responsabilité limitée (EURL)</p>
                <p><strong>SIRET :</strong> 842 716 045 00013</p>
                <p><strong>Code NAF :</strong> 47.21Z - Commerce de détail de fruits et légumes en magasin spécialisé</p>
                <p><strong>Adresse :</strong> Centre Commercial des Thébaudières, 1 rue du Nil, 44800 Saint-Herblain</p>
                <p><strong>Téléphone :</strong> +33 2 40 63 49 31</p>
                <p><strong>Email :</strong> contact@aumatinvert.fr</p>
                <p><strong>Site web :</strong> https://aumatinvert.fr</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Directeur de publication</h2>
              <p>Le directeur de la publication du site est le gérant de Au Matin Vert.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Hébergement</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Hébergeur :</strong> Vercel Inc.</p>
                <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                <p><strong>Site web :</strong> https://vercel.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Propriété intellectuelle</h2>
              <p className="mb-3">
                L'ensemble des éléments de ce site (textes, images, logos, vidéos, design)
                sont la propriété exclusive de Au Matin Vert, sauf mention contraire.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication ou adaptation
                de tout ou partie des éléments du site est interdite sans autorisation écrite préalable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Données personnelles</h2>
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD) et à la
                loi Informatique et Libertés, vous disposez de droits sur vos données personnelles.
              </p>
              <p className="mt-3">
                Pour plus d'informations, consultez notre
                <a href="/privacy-policy" className="text-site-primary hover:underline ml-1">
                  Politique de Confidentialité
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
              <p>
                Ce site utilise des cookies techniques nécessaires à son bon fonctionnement
                (gestion du panier, session utilisateur). Aucun cookie de tracking ou publicitaire
                n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation de responsabilité</h2>
              <p className="mb-3">
                Au Matin Vert s'efforce d'assurer l'exactitude et la mise à jour des informations
                diffusées sur ce site. Toutefois, nous ne pouvons garantir l'exactitude,
                la précision ou l'exhaustivité des informations mises à disposition.
              </p>
              <p>
                Au Matin Vert ne pourra être tenue responsable des dommages directs ou indirects
                résultant de l'accès au site ou de l'utilisation de celui-ci.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Liens hypertextes</h2>
              <p>
                Le site peut contenir des liens vers d'autres sites. Au Matin Vert n'exerce
                aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Droit applicable</h2>
              <p>
                Les présentes mentions légales sont soumises au droit français. Tout litige
                relatif à l'utilisation du site sera soumis aux tribunaux compétents.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
              <p className="mb-3">
                Pour toute question concernant les mentions légales, vous pouvez nous contacter :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">EURL AU MATIN VERT</p>
                <p>Adresse : Centre Commercial des Thébaudières, 1 rue du Nil, 44800 Saint-Herblain</p>
                <p>Email : contact@aumatinvert.fr</p>
                <p>Téléphone : +33 2 40 63 49 31</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
