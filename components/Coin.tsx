import React from 'react';
import { CoinSide } from '../types';

interface CoinProps {
  flipping: boolean;
  result: CoinSide | null;
}

export const Coin: React.FC<CoinProps> = ({ flipping, result }) => {
  let animationClass = '';
  let staticStyle = {};
  
  if (flipping) {
    if (result === CoinSide.HEADS) {
      animationClass = 'animate-flip-heads';
    } else if (result === CoinSide.TAILS) {
      animationClass = 'animate-flip-tails';
    }
  } else {
    // When animation stops, force the rotation to match the result
    // This fixes the bug where it snaps back to Heads if the CSS class is missing
    if (result === CoinSide.HEADS) {
      staticStyle = { transform: 'rotateY(0deg)' };
    } else if (result === CoinSide.TAILS) {
      staticStyle = { transform: 'rotateY(180deg)' };
    }
  }

  // To create a "Thick" coin, we stack multiple layers on the Z axis.
  // 14 internal layers + 2 faces = 16px thickness approx.
  const layers = Array.from({ length: 14 }).map((_, i) => {
    const z = (i - 7) * 1; // Spread from -7px to +7px
    // Alternating edge colors for texture
    const color = i % 2 === 0 ? 'bg-blue-900' : 'bg-slate-300';
    return (
      <div 
        key={i}
        className={`absolute inset-0 rounded-full ${color} border border-blue-900`}
        style={{ transform: `translateZ(${z}px)` }}
      />
    );
  });

  return (
    <div className="relative w-56 h-56 sm:w-72 sm:h-72 perspective-1000 mx-auto my-8">
      <div 
        className={`w-full h-full relative transform-style-3d ${animationClass}`}
        style={!flipping ? staticStyle : undefined}
      >
        {/* THICKNESS LAYERS (EDGE) */}
        {layers}

        {/* HEADS FACE (Front) - Z = 8px */}
        <div 
          className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center bg-white shadow-[inset_0_0_30px_rgba(30,58,138,0.3)] border-[4px] border-blue-900"
          style={{ transform: 'translateZ(8px)' }}
        >
           {/* Decorative Rings */}
           <div className="absolute inset-1 rounded-full border-4 border-blue-100 border-double"></div>
           <div className="absolute inset-4 rounded-full border border-blue-200 border-dashed opacity-60"></div>
           
           {/* Center Content */}
           <div className="flex flex-col items-center justify-center text-blue-900">
              <span className="text-8xl font-gzhel drop-shadow-md select-none">О</span>
              <span className="text-xs font-bold tracking-[0.3em] mt-3 select-none">GZHELCOIN</span>
           </div>
           
           {/* Shine */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full pointer-events-none"></div>
        </div>

        {/* TAILS FACE (Back) - Z = -8px (Rotated 180) */}
        <div 
          className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center bg-blue-900 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] border-[4px] border-white"
          style={{ transform: 'rotateY(180deg) translateZ(8px)' }}
        >
           {/* Decorative Rings */}
           <div className="absolute inset-1 rounded-full border-4 border-blue-400 border-double"></div>
           
           {/* Center Content */}
           <div className="flex flex-col items-center justify-center text-white">
              <span className="text-8xl font-gzhel drop-shadow-md select-none">Р</span>
              <span className="text-xs text-blue-200 font-bold tracking-[0.3em] mt-3 select-none">GZHELCOIN</span>
           </div>

           {/* Shine */}
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full pointer-events-none"></div>
        </div>
        
      </div>
      
      {/* Floor Shadow */}
      <div className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-black/40 blur-xl rounded-[100%] transition-all duration-300 ${flipping ? 'scale-50 opacity-20' : 'scale-100 opacity-60'}`} />
    </div>
  );
};