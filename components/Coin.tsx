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
    if (result === CoinSide.HEADS) {
      staticStyle = { transform: 'rotateY(0deg)' };
    } else if (result === CoinSide.TAILS) {
      staticStyle = { transform: 'rotateY(180deg)' };
    }
  }

  // To create a "Thick" coin, we stack multiple layers on the Z axis.
  const layers = Array.from({ length: 14 }).map((_, i) => {
    const z = (i - 7) * 1; 
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
    // Reduced size: w-44 (176px) instead of w-56 (224px) for better mobile fit
    <div className="relative w-44 h-44 sm:w-64 sm:h-64 perspective-1000 mx-auto my-6">
      <div 
        className={`w-full h-full relative transform-style-3d ${animationClass}`}
        style={!flipping ? staticStyle : undefined}
      >
        {/* THICKNESS LAYERS */}
        {layers}

        {/* HEADS FACE (Front) */}
        <div 
          className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center bg-white shadow-[inset_0_0_30px_rgba(30,58,138,0.3)] border-[4px] border-blue-900"
          style={{ transform: 'translateZ(8px)' }}
        >
           <div className="absolute inset-1 rounded-full border-4 border-blue-100 border-double"></div>
           <div className="absolute inset-4 rounded-full border border-blue-200 border-dashed opacity-60"></div>
           
           <div className="flex flex-col items-center justify-center text-blue-900">
              <span className="text-7xl font-gzhel drop-shadow-md select-none">О</span>
              <span className="text-[10px] font-bold tracking-[0.3em] mt-2 select-none">GZHELCOIN</span>
           </div>
           
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full pointer-events-none"></div>
        </div>

        {/* TAILS FACE (Back) */}
        <div 
          className="absolute inset-0 rounded-full backface-hidden flex items-center justify-center bg-blue-900 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)] border-[4px] border-white"
          style={{ transform: 'rotateY(180deg) translateZ(8px)' }}
        >
           <div className="absolute inset-1 rounded-full border-4 border-blue-400 border-double"></div>
           
           <div className="flex flex-col items-center justify-center text-white">
              <span className="text-7xl font-gzhel drop-shadow-md select-none">Р</span>
              <span className="text-[10px] text-blue-200 font-bold tracking-[0.3em] mt-2 select-none">GZHELCOIN</span>
           </div>

           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rounded-full pointer-events-none"></div>
        </div>
        
      </div>
      
      {/* Floor Shadow */}
      <div className={`absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black/40 blur-xl rounded-[100%] transition-all duration-300 ${flipping ? 'scale-50 opacity-20' : 'scale-100 opacity-60'}`} />
    </div>
  );
};
