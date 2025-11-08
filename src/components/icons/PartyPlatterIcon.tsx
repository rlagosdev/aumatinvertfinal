import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const PartyPlatterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Plateau ovale */}
      <ellipse
        cx="12"
        cy="14"
        rx="9"
        ry="6"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      {/* Éléments sur le plateau - disposition artistique */}
      {/* Fromage */}
      <path
        d="M7 12L9 10L11 12L9 14L7 12Z"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="currentColor"
        opacity="0.3"
      />

      {/* Raisin */}
      <circle cx="14" cy="12" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="15" cy="13" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="13" cy="13.5" r="0.9" fill="currentColor" opacity="0.5" />

      {/* Olives */}
      <circle cx="10" cy="15" r="0.7" fill="currentColor" opacity="0.6" />
      <circle cx="16" cy="15" r="0.7" fill="currentColor" opacity="0.6" />

      {/* Tranche de pain/crackers */}
      <rect
        x="8"
        y="16"
        width="2"
        height="1.5"
        rx="0.3"
        stroke="currentColor"
        strokeWidth="0.8"
        opacity="0.5"
      />

      {/* Feuilles décoratives */}
      <path
        d="M17 11C17 11 18 10 18.5 9.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M17.5 11.5C17.5 11.5 18.5 11.5 19 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Confettis/décoration festive */}
      <circle cx="6" cy="10" r="0.5" fill="currentColor" opacity="0.7" />
      <circle cx="18" cy="16" r="0.5" fill="currentColor" opacity="0.7" />
      <path
        d="M5 14L4 15"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M19 13L20 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};

export default PartyPlatterIcon;
