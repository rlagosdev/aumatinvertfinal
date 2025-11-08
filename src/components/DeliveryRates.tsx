import React from 'react';
import { useDeliveryRates } from '../hooks/useDeliveryRates';

interface DeliveryRatesProps {
  className?: string;
}

const DeliveryRates: React.FC<DeliveryRatesProps> = ({ className = '' }) => {
  const { rates, loading, error, formatRateDisplay } = useDeliveryRates();

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-red-600 text-sm">
          Erreur lors du chargement des tarifs
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {rates.map((rate) => (
        <div 
          key={rate.id} 
          className={`${rate.rate === 0 ? 'text-green-600 font-medium' : 'text-zinc-600'}`}
        >
          {formatRateDisplay(rate)}
        </div>
      ))}
    </div>
  );
};

export default DeliveryRates;