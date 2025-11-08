import React from 'react';

const BotanicalPattern: React.FC = () => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ zIndex: 0 }}
    >
      <defs>
        <pattern
          id="botanical-leaves"
          x="0"
          y="0"
          width="200"
          height="200"
          patternUnits="userSpaceOnUse"
        >
          {/* Feuille 1 - Simple leaf */}
          <path
            d="M 30 40 Q 35 30, 40 40 Q 35 50, 30 40"
            fill="none"
            stroke="#d8e5d3"
            strokeWidth="1.8"
            opacity="0.7"
          />
          <line x1="35" y1="40" x2="35" y2="30" stroke="#d8e5d3" strokeWidth="1" opacity="0.6" />

          {/* Feuille 2 - Curved leaf */}
          <path
            d="M 80 80 Q 90 70, 100 80 Q 90 90, 80 80"
            fill="none"
            stroke="#e0ebe0"
            strokeWidth="1.8"
            opacity="0.6"
          />
          <line x1="90" y1="80" x2="90" y2="68" stroke="#e0ebe0" strokeWidth="1" opacity="0.5" />

          {/* Feuille 3 - Small leaf */}
          <path
            d="M 150 30 Q 153 25, 156 30 Q 153 35, 150 30"
            fill="none"
            stroke="#d5e3cf"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Feuille 4 - Elongated leaf */}
          <path
            d="M 120 140 Q 128 120, 136 140 Q 128 160, 120 140"
            fill="none"
            stroke="#dce8d7"
            strokeWidth="1.8"
            opacity="0.7"
          />
          <line x1="128" y1="140" x2="128" y2="118" stroke="#dce8d7" strokeWidth="1" opacity="0.6" />
          <line x1="128" y1="140" x2="124" y2="128" stroke="#dce8d7" strokeWidth="0.8" opacity="0.5" />
          <line x1="128" y1="140" x2="132" y2="128" stroke="#dce8d7" strokeWidth="0.8" opacity="0.5" />

          {/* Feuille 5 - Willow-like leaf */}
          <path
            d="M 60 160 Q 65 145, 70 160 Q 65 175, 60 160"
            fill="none"
            stroke="#dae7d5"
            strokeWidth="1.6"
            opacity="0.6"
          />
          <line x1="65" y1="160" x2="65" y2="143" stroke="#dae7d5" strokeWidth="0.9" opacity="0.5" />

          {/* Feuille 6 - Wide leaf */}
          <path
            d="M 170 100 Q 180 92, 190 100 Q 180 108, 170 100"
            fill="none"
            stroke="#d6e4d1"
            strokeWidth="1.7"
            opacity="0.6"
          />

          {/* Feuille 7 - Additional leaf */}
          <path
            d="M 10 120 Q 15 110, 20 120 Q 15 130, 10 120"
            fill="none"
            stroke="#d9e6d4"
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Feuille 8 - Additional leaf */}
          <path
            d="M 180 50 Q 185 42, 190 50 Q 185 58, 180 50"
            fill="none"
            stroke="#dbe8d6"
            strokeWidth="1.4"
            opacity="0.6"
          />

          {/* Small sprigs */}
          <circle cx="25" cy="90" r="2" fill="#d8e5d3" opacity="0.5" />
          <circle cx="140" cy="60" r="1.8" fill="#dce8d7" opacity="0.5" />
          <circle cx="95" cy="180" r="2" fill="#d5e3cf" opacity="0.5" />
          <circle cx="175" cy="165" r="2" fill="#d9e6d4" opacity="0.5" />

          {/* Brins et petites branches */}
          <path d="M 45 50 Q 48 45, 51 50" fill="none" stroke="#d8e5d3" strokeWidth="1" opacity="0.5" />
          <path d="M 130 85 Q 133 80, 136 85" fill="none" stroke="#dce8d7" strokeWidth="1" opacity="0.5" />

          {/* Tiny dots for texture */}
          <circle cx="50" cy="70" r="1" fill="#d8e5d3" opacity="0.4" />
          <circle cx="110" cy="110" r="1" fill="#dce8d7" opacity="0.4" />
          <circle cx="160" cy="145" r="1" fill="#d5e3cf" opacity="0.4" />
          <circle cx="35" cy="155" r="1" fill="#dae7d5" opacity="0.4" />
          <circle cx="185" cy="120" r="1" fill="#d9e6d4" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#botanical-leaves)" />
    </svg>
  );
};

export default BotanicalPattern;
