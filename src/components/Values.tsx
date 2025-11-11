import React from 'react';
import { Leaf, Heart, Users, ShoppingBag, Truck } from 'lucide-react';

const Values: React.FC = () => {
  const values = [
    {
      icon: Leaf,
      title: 'Produits frais chaque jour',
      description: 'Des produits sélectionnés avec soin chaque matin pour vous garantir fraîcheur et qualité.',
      color: 'text-green-600'
    },
    {
      icon: Heart,
      title: 'Saveurs locales & artisanales',
      description: 'Découvrez des produits authentiques issus de producteurs et artisans de la région.',
      color: 'text-site-buttons'
    },
    {
      icon: ShoppingBag,
      title: 'Cadeaux gourmands maison',
      description: 'Plateaux, corbeilles et compositions gourmandes confectionnés avec amour pour vos occasions spéciales.',
      color: 'text-site-primary'
    },
    {
      icon: Truck,
      title: 'Livraison ou retrait simple',
      description: 'Livraison à domicile ou retrait sur place, choisissez la formule qui vous convient le mieux.',
      color: 'text-cyan-600'
    },
    {
      icon: Users,
      title: 'Conseils personnalisés',
      description: 'Notre équipe vous écoute et vous conseille pour chaque achat, parce que chaque client compte.',
      color: 'text-purple-600'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-zinc-800 mb-4">
            Ce qui nous rend unique
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Une épicerie de quartier où chaque détail compte, pour votre plus grand plaisir.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div key={index} className="text-center group">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                    <IconComponent className={`h-8 w-8 ${value.color}`} />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-zinc-800">
                  {value.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Values;