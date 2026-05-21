import type React from 'react';

interface LogoIconProps {
  className?: string;
}

const LogoIcon: React.FC<LogoIconProps> = ({ className }) => (
  <div className={`${className} flex items-center justify-center overflow-hidden`}>
    <img 
      src="/datanexusicono.png" 
      alt="DataNexus Logo" 
      className="w-full h-full object-contain"
      onError={(e) => {
        // Fallback en caso de que la imagen no exista todavía
        e.currentTarget.src = "https://placehold.co/100x100/64B5F6/white?text=DN";
      }}
    />
  </div>
);

export default LogoIcon;
