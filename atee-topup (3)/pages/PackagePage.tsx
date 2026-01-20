
import React from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Package as PackageIcon, Plus, Zap, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { DB } from '../db';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../App';

export const PackagePage = () => {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const { addToCart } = useCart();
  const { showToast } = useNotification();
  
  const games = DB.getGames();
  const packages = DB.getPackages();

  const game = games.find(g => g.id === gameId);
  
  // Filter and Sort packages
  const gamePackages = packages
    .filter(p => p.gameId === gameId && p.active)
    .sort((a, b) => {
      const priceA = (a.isFlashSale && a.flashSalePrice) ? a.flashSalePrice : a.price;
      const priceB = (b.isFlashSale && b.flashSalePrice) ? b.flashSalePrice : b.price;
      return priceA - priceB;
    });

  if (!game) return <Navigate to="/" />;

  const handleAddToCart = (e: React.MouseEvent, pkg: any) => {
    e.stopPropagation();
    const isFlashSale = pkg.isFlashSale && pkg.flashSalePrice;
    const finalPrice = isFlashSale ? pkg.flashSalePrice : pkg.price;

    addToCart({
      gameId: game.id,
      packageId: pkg.id,
      price: finalPrice,
      name: pkg.name,
      gameName: game.name,
      image: game.image
    });
    showToast('เพิ่มสินค้าลงตะกร้าแล้ว', 'success');
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-4xl mx-auto space-y-8 animate-smooth-in">
      
      {/* Navigation Header */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white px-6 py-3 rounded-full text-xs font-black text-slate-500 shadow-sm border border-white hover:bg-slate-50 transition-all active:scale-95"
        >
          <ArrowRight className="rotate-180" size={16} /> BACK
        </button>
        <div className="bg-slate-900 px-6 py-3 rounded-full text-xs font-black text-white shadow-lg flex items-center gap-2">
          <PackageIcon size={16} /> SELECT PACKAGE
        </div>
      </div>

      {/* Game Hero Banner */}
      <div className="w-full bg-white rounded-[50px] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl border border-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-100 opacity-50"></div>
        
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden shrink-0 border-4 border-slate-50 shadow-lg relative z-10 bg-white">
           <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
        </div>
        
        <div className="flex-1 text-center md:text-left relative z-10 space-y-3">
           <div className="inline-block px-4 py-1 bg-blue-50 text-blue-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
             {game.category}
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter uppercase leading-none">{game.name}</h1>
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-400 text-xs font-bold">
             <div className="flex items-center gap-1"><ShieldCheck size={14} className="text-green-500" /> Official Service</div>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <div>Instant Delivery</div>
             <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
             <div>24/7 Support</div>
           </div>
        </div>
      </div>

      {/* Package List - Horizontal Rectangular Cards (50px Radius) */}
      <div className="space-y-5">
          {gamePackages.length === 0 && (
             <div className="text-center py-24 bg-white/50 rounded-[50px] border-2 border-dashed border-white text-slate-400 font-bold flex flex-col items-center gap-4">
                <PackageIcon size={48} className="opacity-20"/>
                <span>ไม่พบแพ็กเกจสินค้าในขณะนี้</span>
             </div>
          )}
          
          {gamePackages.map((pkg, idx) => {
             const isFlashSale = pkg.isFlashSale && pkg.flashSalePrice;
             const displayPrice = isFlashSale ? pkg.flashSalePrice : pkg.price;

             return (
              <div 
                key={pkg.id}
                onClick={() => navigate(`/summary/${pkg.id}`)}
                className={`group relative bg-white rounded-[50px] p-4 md:p-6 border border-white hover:border-blue-200 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer animate-smooth-in stagger-${(idx % 4) + 1} hover:-translate-y-1`}
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  
                  {/* Left: Image Thumbnail */}
                  <div className="relative w-full md:w-auto flex justify-center md:block">
                    <div className="w-20 h-20 md:w-28 md:h-28 rounded-[35px] overflow-hidden bg-slate-50 border border-slate-100 shrink-0 shadow-inner">
                      <img src={game.image} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />
                    </div>
                    {isFlashSale && (
                      <div className="absolute -top-2 -right-2 md:-top-2 md:-right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-pulse border-2 border-white z-10">
                        <Zap size={14} fill="currentColor"/>
                      </div>
                    )}
                  </div>

                  {/* Middle: Package Details */}
                  <div className="flex-1 min-w-0 py-1 space-y-2 text-center md:text-left w-full">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      {isFlashSale && <span className="bg-red-50 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-red-100">Flash Sale</span>}
                      {pkg.allowInstallment && <span className="bg-purple-50 text-purple-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border border-purple-100 flex items-center gap-1"><CreditCard size={10}/> ผ่อนได้</span>}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{pkg.name}</h3>
                    
                    <div className="flex items-baseline justify-center md:justify-start gap-3">
                      <div className={`text-2xl md:text-3xl font-black tracking-tight ${isFlashSale ? 'text-red-500' : 'text-blue-600'}`}>
                        ฿{displayPrice?.toLocaleString()}
                      </div>
                      {isFlashSale && (
                        <div className="text-xs font-bold text-slate-300 line-through">฿{pkg.price.toLocaleString()}</div>
                      )}
                    </div>
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-row md:flex-col gap-3 shrink-0 w-full md:w-auto">
                     <button 
                        onClick={(e) => handleAddToCart(e, pkg)}
                        className="flex-1 md:flex-none h-12 md:w-14 md:h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 hover:text-slate-600 transition-all border border-slate-100 group-active:scale-90"
                        title="เพิ่มลงตะกร้า"
                     >
                        <Plus size={24} strokeWidth={3} />
                     </button>
                     <button className="flex-1 md:flex-none h-12 md:w-14 md:h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-all hover:scale-110 active:scale-95 group-active:scale-90">
                       <ArrowRight size={24} />
                     </button>
                  </div>

                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
