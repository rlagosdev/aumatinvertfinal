import React from 'react';
import { Shield } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-site-primary mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Politique de Confidentialité</h1>
          </div>

          <p className="text-sm text-gray-600 mb-8">
            Dernière mise à jour : 8 novembre 2025
          </p>

          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Collecte des données</h2>
              <p className="mb-3">
                Au Matin Vert collecte les données personnelles suivantes lorsque vous passez commande :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nom et prénom</li>
                <li>Adresse email</li>
                <li>Numéro de téléphone</li>
                <li>Adresse de livraison</li>
                <li>Informations de commande (produits, quantités, prix)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Utilisation des données</h2>
              <p className="mb-3">Vos données personnelles sont utilisées uniquement pour :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Traiter et gérer vos commandes</li>
                <li>Vous envoyer des confirmations de commande par email</li>
                <li>Communiquer avec vous concernant votre commande</li>
                <li>Améliorer nos services</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Conservation des données</h2>
              <p>
                Vos données sont conservées pendant la durée nécessaire au traitement de votre commande
                et conformément aux obligations légales (3 ans pour les données de facturation).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Partage des données</h2>
              <p className="mb-3">
                Nous ne vendons, ne louons ni ne partageons vos données personnelles avec des tiers,
                à l'exception de :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Prestataires de services nécessaires à l'exécution de votre commande (paiement, livraison)</li>
                <li>Autorités légales si requis par la loi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Sécurité des données</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées
                pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Vos droits (RGPD)</h2>
              <p className="mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Droit d'accès</strong> : accéder à vos données personnelles</li>
                <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
                <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
                <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
                <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
              <p>
                Notre site utilise des cookies techniques nécessaires au bon fonctionnement du site
                (panier, session). Nous n'utilisons pas de cookies de tracking ou publicitaires.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact</h2>
              <p className="mb-3">
                Pour exercer vos droits ou pour toute question concernant vos données personnelles,
                vous pouvez nous contacter :
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">EURL AU MATIN VERT</p>
                <p>Adresse : Centre Commercial des Thébaudières, 1 rue du Nil, 44800 Saint-Herblain</p>
                <p>Email : contact@aumatinvert.fr</p>
                <p>Téléphone : +33 2 40 63 49 31</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications</h2>
              <p>
                Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                Les modifications entrent en vigueur dès leur publication sur cette page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
