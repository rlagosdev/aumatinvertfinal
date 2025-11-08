import React from 'react';
import { FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <FileText className="h-8 w-8 text-site-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Conditions Générales de Vente</h1>
          </div>

          <p className="text-sm text-gray-600 mb-8">
            Dernière mise à jour : 8 novembre 2025
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Informations générales</h2>
              <p className="mb-3">
                Les présentes conditions générales de vente (CGV) régissent les ventes de produits
                alimentaires biologiques et locaux réalisées par <strong>EURL AU MATIN VERT</strong>.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">EURL AU MATIN VERT</p>
                <p>SIRET : 842 716 045 00013</p>
                <p>Adresse : Centre Commercial des Thébaudières, 1 rue du Nil, 44800 Saint-Herblain</p>
                <p>Téléphone : +33 2 40 63 49 31</p>
                <p>Email : contact@aumatinvert.fr</p>
                <p>Site web : https://aumatinvert.fr</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Produits</h2>
              <p>
                Nous proposons des produits alimentaires biologiques et locaux : fruits, légumes,
                produits laitiers, conserves, etc. Tous nos produits sont décrits avec précision
                sur le site. Les photos sont non contractuelles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Prix</h2>
              <p className="mb-3">
                Les prix de nos produits sont indiqués en euros TTC (toutes taxes comprises).
                Nous nous réservons le droit de modifier nos prix à tout moment, mais les produits
                seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Commande</h2>
              <p className="mb-3">Pour passer commande :</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Ajoutez les produits souhaités à votre panier</li>
                <li>Vérifiez votre panier et cliquez sur "Commander"</li>
                <li>Remplissez vos coordonnées</li>
                <li>Choisissez votre mode de retrait/livraison</li>
                <li>Validez et payez votre commande</li>
              </ol>
              <p className="mt-3">
                La validation de votre commande implique l'acceptation des présentes CGV
                et constitue une preuve du contrat de vente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Paiement</h2>
              <p className="mb-3">Le paiement s'effectue :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>En ligne par carte bancaire (paiement sécurisé via Stripe)</li>
                <li>En espèces lors du retrait (selon disponibilité)</li>
              </ul>
              <p className="mt-3">
                Votre commande ne sera traitée qu'après réception et validation du paiement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Livraison et retrait</h2>
              <p className="mb-3">
                Nous proposons deux modes de récupération de vos commandes :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-3">
                <li><strong>Retrait sur place</strong> : Gratuit - Retirez votre commande à l'adresse indiquée</li>
                <li><strong>Livraison à domicile</strong> : Dans un rayon de 2km autour de notre point de vente</li>
              </ul>
              <p>
                Les délais de préparation sont indiqués lors de la commande. Vous serez notifié
                par email lorsque votre commande sera prête.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Droit de rétractation</h2>
              <p className="mb-3">
                Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation
                ne s'applique pas aux produits alimentaires périssables.
              </p>
              <p>
                En cas de problème avec votre commande (produit défectueux, erreur de préparation),
                contactez-nous dans les 24h suivant la réception.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Garanties</h2>
              <p>
                Nos produits bénéficient de la garantie légale de conformité et de la garantie
                contre les vices cachés prévues par le Code de la consommation.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Réclamations</h2>
              <p>
                Pour toute réclamation, contactez-nous par email à contact@aumatinvert.fr
                ou par téléphone au +33 2 40 63 49 31.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Données personnelles</h2>
              <p>
                Le traitement de vos données personnelles est décrit dans notre
                <a href="/privacy-policy" className="text-site-primary hover:underline ml-1">
                  Politique de Confidentialité
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Loi applicable</h2>
              <p>
                Les présentes CGV sont soumises au droit français. En cas de litige,
                une solution amiable sera recherchée avant toute action judiciaire.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
