import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const CheeseIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Plateau de fromages - forme triangulaire stylisée */}
      <path
        d="M3 18L12 4L21 18H3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trous dans le fromage */}
      <circle cx="10" cy="13" r="1.2" fill="currentColor" opacity="0.4" />
      <circle cx="13" cy="11" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="9" cy="15.5" r="0.9" fill="currentColor" opacity="0.4" />
      <circle cx="14" cy="14" r="1" fill="currentColor" opacity="0.4" />

      {/* Détails de texture */}
      <path
        d="M7 16C7 16 8.5 15.5 10 16"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M15 15C15 15 16 14.5 17 15"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Base du plateau */}
      <path
        d="M2 18H22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Couteau décoratif */}
      <path
        d="M18 19L20 21"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="20.5" cy="21.5" r="0.5" fill="currentColor" />
    </svg>
  );
};

export default CheeseIcon;
