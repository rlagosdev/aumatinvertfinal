import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

const WeddingIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coupe de champagne stylisée */}
      <path
        d="M8 3L8.5 10C8.5 11 9 12 10 12H11V19H9V21H15V19H13V12H14C15 12 15.5 11 15.5 10L16 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bulles de champagne */}
      <circle cx="10" cy="7" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="5" r="0.6" fill="currentColor" opacity="0.7" />
      <circle cx="14" cy="8" r="0.5" fill="currentColor" opacity="0.6" />
      <circle cx="11" cy="9" r="0.4" fill="currentColor" opacity="0.5" />

      {/* Anneaux entrelacés (alliance) */}
      <circle
        cx="18"
        cy="8"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />
      <circle
        cx="20.5"
        cy="10"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
      />

      {/* Coeur décoratif */}
      <path
        d="M5 9C5 9 4 8 3.5 7C3 6 3 5 4 4.5C5 4 6 4.5 6.5 5.5C7 4.5 8 4 9 4.5C10 5 10 6 9.5 7C9 8 8 9 8 9L6.5 10.5L5 9Z"
        fill="currentColor"
        opacity="0.3"
      />

      {/* Étincelles/confettis */}
      <path d="M2 14L3 15" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M4 16L5 17" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <circle cx="3" cy="18" r="0.4" fill="currentColor" opacity="0.5" />
    </svg>
  );
};

export default WeddingIcon;
