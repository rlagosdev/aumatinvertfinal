import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const CorporateGiftIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Attaché case/Mallette */}
      <rect
        x="4"
        y="9"
        width="16"
        height="11"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Poignée */}
      <path
        d="M8 9V7C8 5.89543 8.89543 5 10 5H14C15.1046 5 16 5.89543 16 7V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Fermoir central */}
      <rect
        x="11"
        y="13"
        width="2"
        height="3"
        rx="0.5"
        fill="currentColor"
        opacity="0.5"
      />

      {/* Lignes de séparation de la mallette */}
      <line
        x1="4"
        y1="13"
        x2="20"
        y2="13"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* Ruban décoratif (cadeau d'entreprise) */}
      <path
        d="M12 5L12 2M12 2L10 3.5M12 2L14 3.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Étoile/Badge qualité */}
      <path
        d="M17 17L18 16L19 17L18.5 15.5L20 15L18.5 14.5L19 13L17 14L15 13L15.5 14.5L14 15L15.5 15.5L15 17L17 16"
        fill="currentColor"
        opacity="0.4"
      />

      {/* Détails coins */}
      <circle cx="6" cy="11" r="0.5" fill="currentColor" opacity="0.5" />
      <circle cx="18" cy="11" r="0.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
};

export default CorporateGiftIcon;
