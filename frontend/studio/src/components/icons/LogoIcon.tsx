
'use client';

import React, { useEffect, useState } from 'react';

interface LogoIconProps {
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={className} />;

  return (
    <div className={className}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full h-full">
        <defs>
          <linearGradient id="blueGradient" x1="50" y1="450" x2="450" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000a5c" />
            <stop offset="50%" stopColor="#0055ff" />
            <stop offset="100%" stopColor="#00c8ff" />
          </linearGradient>
        </defs>

        <g fill="url(#blueGradient)" stroke="url(#blueGradient)">
          <path d="M 180 100 L 280 100 C 390 100 440 180 440 270 C 440 370 380 430 280 430 L 180 430 L 180 340 L 240 340 C 300 340 330 310 330 270 C 330 220 300 180 240 180 L 180 180 Z" stroke="none" />
          
          <rect x="140" y="180" width="24" height="24" rx="3" stroke="none" />
          <rect x="95" y="220" width="35" height="35" rx="4" stroke="none" />
          <rect x="165" y="225" width="40" height="40" rx="4" stroke="none" />
          <rect x="135" y="265" width="25" height="25" rx="3" stroke="none" />
          <rect x="90" y="285" width="20" height="20" rx="3" stroke="none" />
          <rect x="165" y="295" width="35" height="35" rx="4" stroke="none" />
          <rect x="120" y="320" width="26" height="26" rx="3" stroke="none" />

          <line x1="200" y1="190" x2="300" y2="250" strokeWidth="8" />
          <line x1="235" y1="290" x2="300" y2="250" strokeWidth="8" />
          <line x1="300" y1="250" x2="340" y2="350" strokeWidth="8" />

          <circle cx="200" cy="190" r="18" stroke="none" />
          <circle cx="300" cy="250" r="20" stroke="none" />
          <circle cx="235" cy="290" r="18" stroke="none" />
          <circle cx="340" cy="350" r="18" stroke="none" />
        </g>
      </svg>
    </div>
  );
};

export default LogoIcon;
