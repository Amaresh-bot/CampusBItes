import React, { useState } from 'react';

interface FallbackImageProps {
  id?: string;
  srcs: string[];
  alt: string;
  className?: string;
  type: 'logo' | 'banner' | 'emblem';
}

export const FallbackImage: React.FC<FallbackImageProps> = ({
  id,
  srcs,
  alt,
  className = '',
  type
}) => {
  const [srcIndex, setSrcIndex] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  const handleError = () => {
    if (srcIndex + 1 < srcs.length) {
      setSrcIndex(srcIndex + 1);
    } else {
      setFailedAll(true);
    }
  };

  if (failedAll) {
    if (type === 'logo') {
      return (
        <div
          id={id}
          className={`flex items-center justify-center bg-college-blue-500 text-white rounded-lg font-bold shadow-sm font-display select-none shrink-0 ${className}`}
          style={{ aspectRatio: '1/1' }}
        >
          <div className="text-center flex flex-col items-center justify-center">
            <span className="text-[12px] leading-none text-college-gold-300 font-display font-black tracking-tighter">SPHN</span>
            <div className="w-1.5 h-1.5 bg-college-gold-450 rounded-full mt-0.5 animate-pulse"></div>
          </div>
        </div>
      );
    }

    if (type === 'emblem') {
      return (
        <div
          id={id}
          className={`flex items-center justify-center bg-college-gold-500 text-college-blue-900 font-black rounded-full select-none shrink-0 border-2 border-college-blue-800 ${className}`}
          style={{ aspectRatio: '1/1' }}
        >
          <span className="text-[10px] font-sans">★</span>
        </div>
      );
    }

    if (type === 'banner') {
      return (
        <div
          id={id}
          className={`relative w-full overflow-hidden bg-cover bg-center select-none flex flex-col justify-center px-6 md:px-12 py-3 md:py-4 border-b-4 border-college-gold-500 bg-linear-to-r from-college-blue-800 via-college-blue-700 to-college-blue-900 text-white ${className}`}
        >
          {/* Subtle architectural vector motif using background styles */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 max-w-7xl mx-auto w-full">
            <div className="text-center md:text-left">
              <span className="inline-block px-2 py-0.5 bg-college-gold-500 text-college-blue-900 font-sans font-black text-[9px] uppercase tracking-wider rounded-md mb-1">
                EAMCET CODE: SPHN
              </span>
              <h2 className="font-display font-black text-lg md:text-2xl text-white tracking-tight uppercase leading-none">
                Sphoorthy Engineering College
              </h2>
              <p className="font-sans font-medium text-xs text-college-gold-200 mt-1 uppercase tracking-wide">
                Towards Excellence • Approved by AICTE, New Delhi & Affiliated to JNTUH, Hyderabad
              </p>
            </div>
            
            <div className="hidden lg:flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl backdrop-blur-xs">
              <div className="w-6 h-6 rounded-full bg-college-gold-500 flex items-center justify-center text-college-blue-900 font-black text-[10px]">
                ★
              </div>
              <div className="text-left">
                <p className="text-[9px] text-college-gold-100 uppercase tracking-widest leading-none font-bold">NAAC Accredited</p>
                <p className="text-[11px] font-mono font-bold leading-tight text-white mt-0.5">GRADE &apos;A+&apos; CAMPUS</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <img
      id={id}
      src={srcs[srcIndex]}
      alt={alt}
      onError={handleError}
      className={className}
    />
  );
};
