
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tv, ArrowLeft, Search, Check, ShoppingCart, Sparkles } from 'lucide-react';
import { DB } from '../db';
import { Game, Package } from '../types';

export const PremiumAppPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState<Game | null>(null);

  const games = DB.getGames();
  const packages = DB.getPackages();

  const premiumApps = useMemo(() => 
    games.filter(g => g.category === 'PremiumApp' && g.active),
    [games]
  );

  const filteredApps = useMemo(() => 
    premiumApps.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [premiumApps, search]
  );

  const appPackages = useMemo(() => 
    selectedApp ? packages.filter(p => p.gameId === selectedApp.id && p.active) : [],
    [selectedApp, packages]
  );

  return (
    <div className="pt-10 pb-20 px-4 max-w-5xl mx-auto space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="p-4 bg-white rounded-full shadow-sm border border-white hover:bg-slate-50 transition-all text-slate-400"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">แอปพรีเมียม</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Watch & Enjoy Premium Accounts</p>
          </div>
        </div>
        
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาแอป..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-white rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-purple-100 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* App Selection List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-[50px] p-8 border border-white shadow-xl space-y-4">
            <h2 className="text-xl font-black text-slate-800 px-2 flex items-center gap-3">
              <Sparkles size={20} className="text-purple-500" /> เลือกบริการ
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {filteredApps.length === 0 && <div className="text-center py-10 text-slate-400 font-bold">ไม่พบแอปที่ต้องการ</div>}
              {filteredApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`flex items-center gap-4 p-4 rounded-[30px] transition-all border ${selectedApp?.id === app.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-white hover:border-purple-100 hover:shadow-md'}`}
                >
                  <img src={app.image} className="w-12 h-12 rounded-[18px] object-cover" alt="" />
                  <div className="flex-1 text-left font-bold text-sm">{app.name}</div>
                  {selectedApp?.id === app.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="lg:col-span-2">
          {!selectedApp ? (
            <div className="h-full min-h-[400px] bg-white/30 rounded-[60px] border-4 border-dashed border-white flex flex-col items-center justify-center space-y-4 text-slate-400">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                 <Tv size={32} />
               </div>
               <p className="font-bold text-lg italic">โปรดเลือกแอปเพื่อดูแพ็กเกจ</p>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              <div className="flex items-center gap-6 p-6 bg-white/80 backdrop-blur rounded-[40px] border border-white shadow-sm">
                 <img src={selectedApp.image} className="w-20 h-20 rounded-[30px] object-cover shadow-lg" alt="" />
                 <div>
                   <div className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Premium Choice</div>
                   <h3 className="text-2xl font-black text-slate-800">{selectedApp.name}</h3>
                   <div className="text-xs font-bold text-slate-400 mt-1">บัญชีแท้ 100% ต่ออายุได้ตลอด ไม่ต้องเปลี่ยนเมลบ่อย</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appPackages.length === 0 && <div className="col-span-full py-20 text-center bg-white rounded-[40px] text-slate-400 font-bold">ไม่มีแพ็กเกจในขณะนี้</div>}
                {appPackages.map(pkg => (
                  <div 
                    key={pkg.id}
                    onClick={() => navigate(`/summary/${pkg.id}`)}
                    className="bg-white rounded-[45px] p-8 shadow-sm border-2 border-white hover:border-purple-100 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-full"
                  >
                    <div className="space-y-3">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedApp.name}</div>
                      <h4 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">{pkg.name}</h4>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="text-3xl font-black text-slate-900">฿{pkg.price.toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <ShoppingCart size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
