import React from 'react';

const CelticKnot: React.FC = () => {
  // Sage green color
  const sageGreen = '#7B8A78';

  return (
    <div className="w-full flex justify-center py-8 mt-12">
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        xmlns="http://www.w3.org/2000/svg"
        className="opacity-60"
      >
        <defs>
          {/* Define a gradient for depth */}
          <linearGradient id="knotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: sageGreen, stopOpacity: 0.9 }} />
            <stop offset="100%" style={{ stopColor: sageGreen, stopOpacity: 0.7 }} />
          </linearGradient>
        </defs>

        {/* Celtic infinity knot pattern - symmetrical and elegant */}
        <g strokeWidth="3" fill="none" stroke="url(#knotGradient)" strokeLinecap="round" strokeLinejoin="round">
          {/* Left loop */}
          <path
            d="M 30 40 Q 10 20, 30 20 Q 50 20, 50 40 Q 50 60, 30 60 Q 10 60, 30 40"
            opacity="0.8"
          />

          {/* Right loop (mirror of left) */}
          <path
            d="M 170 40 Q 190 20, 170 20 Q 150 20, 150 40 Q 150 60, 170 60 Q 190 60, 170 40"
            opacity="0.8"
          />

          {/* Center interlaced pattern */}
          <path
            d="M 50 30 Q 80 15, 100 30 Q 120 15, 150 30"
            opacity="0.9"
          />
          <path
            d="M 50 50 Q 80 65, 100 50 Q 120 65, 150 50"
            opacity="0.9"
          />

          {/* Central vertical element */}
          <ellipse cx="100" cy="40" rx="12" ry="20" opacity="0.7" />

          {/* Connecting horizontal loops */}
          <path
            d="M 50 40 Q 75 35, 88 40"
            opacity="0.85"
          />
          <path
            d="M 150 40 Q 125 35, 112 40"
            opacity="0.85"
          />

          {/* Top decoration */}
          <path
            d="M 70 18 Q 85 10, 100 18 Q 115 10, 130 18"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Bottom decoration */}
          <path
            d="M 70 62 Q 85 70, 100 62 Q 115 70, 130 62"
            strokeWidth="2"
            opacity="0.6"
          />

          {/* Small accent circles */}
          <circle cx="40" cy="40" r="3" fill={sageGreen} opacity="0.5" />
          <circle cx="160" cy="40" r="3" fill={sageGreen} opacity="0.5" />
          <circle cx="100" cy="25" r="2" fill={sageGreen} opacity="0.4" />
          <circle cx="100" cy="55" r="2" fill={sageGreen} opacity="0.4" />
        </g>

        {/* Outer decorative elements */}
        <g stroke={sageGreen} strokeWidth="1.5" fill="none" opacity="0.4">
          {/* Left flourish */}
          <path d="M 15 40 Q 20 30, 25 35" />
          <path d="M 15 40 Q 20 50, 25 45" />

          {/* Right flourish */}
          <path d="M 185 40 Q 180 30, 175 35" />
          <path d="M 185 40 Q 180 50, 175 45" />
        </g>
      </svg>
    </div>
  );
};

export default CelticKnot;
