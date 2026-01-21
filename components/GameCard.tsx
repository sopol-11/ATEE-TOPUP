
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Game } from '../types';

export const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  const navigate = useNavigate();
  return (
    <div 
      className="flex flex-col items-center group cursor-pointer animate-smooth-in"
      onClick={() => navigate(`/game/${game.id}`)}
    >
      <div className="bg-white p-3 rounded-[50px] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] group-hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 w-full border border-white group-hover:translate-y-[-5px]">
        <div className="aspect-square rounded-[40px] overflow-hidden relative border border-slate-50">
          <img 
            src={game.image} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
            alt={game.name} 
          />
          {/* Transparent Glass Name Badge */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 min-w-[120px] text-center shadow-xl">
            <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">{game.name}</span>
          </div>
        </div>
      </div>
      
      {/* Action Button Below Card */}
      <button className="mt-4 w-[85%] py-3.5 bg-white border border-white rounded-full text-[10px] font-black text-slate-400 shadow-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95">
        <ShoppingCart size={14} className="text-slate-300" /> เลือกแพ็กเกจ
      </button>
    </div>
  );
};