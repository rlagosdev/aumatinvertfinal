import React from 'react';

    interface StatusBadgeProps {
      status: string;
    }

    const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
      const getStatusConfig = (status: string) => {
        switch (status) {
          case 'pending':
          case 'en_attente':
            return {
              label: 'En attente',
              bgColor: 'bg-yellow-100',
              textColor: 'text-yellow-800',
            };
          case 'succeeded':
            return {
              label: 'Payée',
              bgColor: 'bg-green-100',
              textColor: 'text-green-800',
            };
          case 'preparing':
            return {
              label: 'En préparation',
              bgColor: 'bg-purple-100',
              textColor: 'text-purple-800',
            };
          case 'ready':
          case 'préparée':
            return {
              label: 'Prête',
              bgColor: 'bg-green-100',
              textColor: 'text-green-800',
            };
          case 'completed':
          case 'livrée':
            return {
              label: 'Récupérée',
              bgColor: 'bg-blue-100',
              textColor: 'text-blue-800',
            };
          case 'canceled':
          case 'annulée':
            return {
              label: 'Annulée',
              bgColor: 'bg-red-100',
              textColor: 'text-red-800',
            };
          case 'refunded':
            return {
              label: 'Remboursée',
              bgColor: 'bg-orange-100',
              textColor: 'text-orange-800',
            };
          default:
            return {
              label: status,
              bgColor: 'bg-gray-100',
              textColor: 'text-gray-800',
            };
        }
      };

      const config = getStatusConfig(status);

      return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
          {config.label}
        </span>
      );
    };

    export default StatusBadge;