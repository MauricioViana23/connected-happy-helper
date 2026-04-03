import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => { setFading(true); }, 2500);
    const timer2 = setTimeout(() => { onComplete(); }, 3500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[999] bg-[#0B0B0F] flex items-center justify-center transition-opacity duration-1000 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-thin tracking-[0.3em] text-white animate-fade-in">
          ENERGY
        </h1>
      </div>
    </div>
  );
};
