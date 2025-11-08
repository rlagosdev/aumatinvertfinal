import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const GiftBasketIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Panier en osier */}
      <path
        d="M4 10C4 9.44772 4.44772 9 5 9H19C19.5523 9 20 9.44772 20 10V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Tressage du panier */}
      <path
        d="M6 12H18M6 15H18"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Fruits/Produits dans le panier */}
      <circle cx="9" cy="7" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="12" cy="6.5" r="1.8" fill="currentColor" opacity="0.8" />
      <circle cx="15" cy="7.2" r="1.4" fill="currentColor" opacity="0.6" />

      {/* Feuilles décoratives */}
      <path
        d="M11 5C11 5 10.5 3.5 9.5 3C9.5 3 10 4 10 5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M13 4.5C13 4.5 13.5 3 14.5 2.5C14.5 2.5 14 3.5 14 4.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Poignée */}
      <path
        d="M8 9C8 9 8 7 9 6C10 5 11 5 12 5C13 5 14 5 15 6C16 7 16 9 16 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default GiftBasketIcon;
