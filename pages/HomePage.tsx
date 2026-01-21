
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, Volume2, Sparkles, Flame, Loader2 } from 'lucide-react';
import { DB } from '../db';
import { GameCard } from '../components/GameCard';
import { PromoBanner, Game, SystemSettings, Package } from '../types';

export const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('ทั้งหมด');
  const [promos, setPromos] = useState<PromoBanner[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DB.getSettings());
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    // Subscribe to all necessary collections for live updates
    const unsubPromos = DB.subscribe('promos', (data) => {
      setPromos(data.filter(p => p.active).sort((a,b) => b.priority - a.priority));
    });

    const unsubGames = DB.subscribe('games', (data) => {
      setGames(data);
    });

    const unsubPackages = DB.subscribe('packages', (data) => {
      setPackages(data);
    });

    const unsubSettings = DB.subscribe('settings', (data) => {
      const global = data.find(d => d.id === 'global');
      if (global) setSettings(global as SystemSettings);
    });

    return () => {
      unsubPromos();
      unsubGames();
      unsubPackages();
      unsubSettings();
    };
  }, []);

  const bannerImages = useMemo(() => {
    if (promos.length > 0) return promos.map(p => p.image);
    return [
      "https://images.unsplash.com/photo-1627389955609-bc02120bc04d?w=1400&h=600&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=600&fit=crop"
    ];
  }, [promos]);

  useEffect(() => {
    if (bannerImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const categories = [
    { id: 'ทั้งหมด', label: 'ทั้งหมด' },
    { id: 'MOBILE', label: 'มือถือ' },
    { id: 'PC', label: 'คอมพิวเตอร์' },
    { id: 'PremiumApp', label: 'แอปพรีเมียม' }
  ];

  // Logic ใหม่: เช็คจาก Package ที่มีสถานะ Flash Sale จริงๆ เท่านั้น
  // ไม่สนใจว่า Game.isFlashSale เป็น true หรือ false (เพื่อแก้ปัญหา Database ไม่ซิงค์)
  const flashSaleGames = useMemo(() => {
    const activeFlashPackages = packages.filter(p => p.active && p.isFlashSale && p.flashSalePrice);
    const gameIdsOnSale = new Set(activeFlashPackages.map(p => p.gameId));
    
    return games.filter(g => g.active && gameIdsOnSale.has(g.id));
  }, [games, packages]);
  
  const filteredGames = useMemo(() => 
    games.filter(g => 
      g.active &&
      g.name.toLowerCase().includes(search.toLowerCase()) && 
      (activeCat === 'ทั้งหมด' || g.category.toUpperCase() === activeCat.toUpperCase())
    ).sort((a, b) => a.orderIndex - b.orderIndex),
    [search, activeCat, games]
  );

  return (
    <div className="pb-20 px-4 max-w-6xl mx-auto space-y-12 mt-10 animate-fade-in">
      
      {/* Announcement Bar */}
      {settings.announcement && (
        <div className="w-full bg-white/40 backdrop-blur-lg border border-white rounded-full py-3 md:py-3.5 px-6 md:px-8 shadow-sm flex items-center gap-3 md:gap-4 overflow-hidden relative">
          <div className="bg-slate-900 text-white p-2.5 rounded-full shrink-0 z-10 shadow-lg">
            <Volume2 size={16} />
          </div>
          <div className="flex-1 overflow-hidden relative h-6 flex items-center">
            <div className="animate-marquee absolute whitespace-nowrap text-[11px] md:text-xs font-black text-slate-700 tracking-tight">
              {settings.announcement}
            </div>
          </div>
        </div>
      )}

      {/* Hero Banner Section */}
      <div className="w-full h-44 md:h-[320px] rounded-[50px] md:rounded-[100px] lg:rounded-[160px] overflow-hidden shadow-2xl border-4 border-white relative bg-white group">
        {promos.length === 0 && games.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-300">
            <Loader2 className="animate-spin" size={48} />
          </div>
        ) : (
          <div 
            className="flex w-full h-full transition-transform duration-1000 ease-in-out"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {bannerImages.map((src, index) => (
              <div key={index} className="w-full h-full shrink-0 relative">
                <img src={src} className="w-full h-full object-cover" alt={`Banner ${index + 1}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              </div>
            ))}
          </div>
        )}
        
        {/* Banner Indicators */}
        {bannerImages.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {bannerImages.map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-2 rounded-full transition-all duration-500 ${currentBanner === i ? 'w-8 bg-white shadow-lg' : 'w-2 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Search & Categories */}
      <div className="space-y-8">
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-6 md:left-7 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="ค้นหาเกม หรือบริการที่คุณต้องการ..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-14 md:px-16 py-4 md:py-5 bg-white border border-white rounded-full text-sm font-bold focus:outline-none shadow-sm focus:shadow-2xl focus:scale-[1.01] transition-all"
          />
        </div>
        
        <div className="flex justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCat(cat.id)}
              className={`px-8 md:px-12 py-3 md:py-3.5 rounded-full text-[10px] md:text-[11px] font-black transition-all whitespace-nowrap border-2 ${activeCat === cat.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-110 z-10' : 'bg-white/70 border-white text-slate-400 hover:text-slate-800'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Flash Sale Section - Only renders if there are actual flash sale packages */}
      {flashSaleGames.length > 0 && (
        <div className="space-y-8 pt-4">
          <div className="flex flex-col items-center gap-2">
             <div className="px-6 py-2 bg-rose-100 text-rose-500 rounded-full text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
               <Zap size={14} fill="currentColor" /> Flash Sale
             </div>
             <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.6em]">Don't Miss Out</h2>
          </div>
          <div className="bg-white/30 backdrop-blur-xl rounded-[60px] md:rounded-[80px] p-6 md:p-10 border border-white flex justify-start md:justify-center gap-6 md:gap-8 overflow-x-auto no-scrollbar shadow-inner">
            {flashSaleGames.map((game, idx) => {
              // Calculate lowest price in flash sale for display
              const gameSalePkgs = packages.filter(p => p.gameId === game.id && p.isFlashSale && p.flashSalePrice);
              const minPrice = gameSalePkgs.length > 0 ? Math.min(...gameSalePkgs.map(p => p.flashSalePrice || 0)) : 0;

              return (
                <div 
                  key={game.id} 
                  onClick={() => navigate(`/game/${game.id}`)}
                  className={`flex flex-col items-center group cursor-pointer shrink-0 w-40 md:w-52 animate-fade-in stagger-${(idx % 3) + 1}`}
                >
                  <div className="bg-white p-2.5 rounded-[40px] md:rounded-[45px] shadow-sm w-full border border-white transition-all group-hover:shadow-2xl group-hover:-translate-y-2 relative">
                     {/* Flame Badge */}
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-slate-50 z-10 shadow-sm animate-pulse">
                      <Flame size={14} fill="currentColor" />
                    </div>
                    
                    <div className="aspect-square rounded-[35px] md:rounded-[40px] overflow-hidden relative">
                      <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 text-center">
                        <div className="text-[9px] font-black text-white/80 uppercase tracking-widest">{game.name}</div>
                        <div className="text-lg font-black text-white">฿{minPrice}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Services Grid */}
      <div className="space-y-8 pt-10">
        <div className="flex items-center gap-4 px-4">
           <div className="p-3 bg-blue-100 text-blue-500 rounded-2xl shadow-sm"><Flame size={24} fill="currentColor" /></div>
           <div>
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">บริการทั้งหมด</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Our Premium Services</p>
           </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 md:gap-x-8 gap-y-12 md:gap-y-16">
          {filteredGames.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white/20 border-2 border-dashed border-white rounded-[50px] text-slate-300 font-bold uppercase tracking-widest">
              No games found
            </div>
          )}
          {filteredGames.map((game, idx) => (
            <div key={game.id} className={`stagger-${(idx % 3) + 1}`}>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};