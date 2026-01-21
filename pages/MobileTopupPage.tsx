
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ArrowLeft, Search, Check, Zap } from 'lucide-react';
import { DB } from '../db';
import { Game, Package } from '../types';

export const MobileTopupPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState<Game | null>(null);

  const games = DB.getGames();
  const packages = DB.getPackages();

  const mobileCarriers = useMemo(() => 
    games.filter(g => g.category === 'MobileTopup' && g.active),
    [games]
  );

  const filteredCarriers = useMemo(() => 
    mobileCarriers.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [mobileCarriers, search]
  );

  const carrierPackages = useMemo(() => 
    selectedCarrier ? packages.filter(p => p.gameId === selectedCarrier.id && p.active) : [],
    [selectedCarrier, packages]
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
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">เติมเงินมือถือ</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Top-up Mobile Credit Fast</p>
          </div>
        </div>
        
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาเครือข่าย..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-white rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Carrier Selection List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-[50px] p-8 border border-white shadow-xl space-y-4">
            <h2 className="text-xl font-black text-slate-800 px-2 flex items-center gap-3">
              <Smartphone size={20} className="text-green-500" /> เลือกเครือข่าย
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {filteredCarriers.length === 0 && <div className="text-center py-10 text-slate-400 font-bold">ไม่พบเครือข่าย</div>}
              {filteredCarriers.map(carrier => (
                <button
                  key={carrier.id}
                  onClick={() => setSelectedCarrier(carrier)}
                  className={`flex items-center gap-4 p-4 rounded-[30px] transition-all border ${selectedCarrier?.id === carrier.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-white hover:border-blue-100 hover:shadow-md'}`}
                >
                  <img src={carrier.image} className="w-12 h-12 rounded-[18px] object-cover" alt="" />
                  <div className="flex-1 text-left font-bold text-sm">{carrier.name}</div>
                  {selectedCarrier?.id === carrier.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="lg:col-span-2">
          {!selectedCarrier ? (
            <div className="h-full min-h-[400px] bg-white/30 rounded-[60px] border-4 border-dashed border-white flex flex-col items-center justify-center space-y-4 text-slate-400">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                 <Zap size={32} />
               </div>
               <p className="font-bold text-lg italic">โปรดเลือกเครือข่ายเพื่อเติมเงิน</p>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              <div className="flex items-center gap-6 p-6 bg-white/80 backdrop-blur rounded-[40px] border border-white shadow-sm">
                 <img src={selectedCarrier.image} className="w-20 h-20 rounded-[30px] object-cover shadow-lg" alt="" />
                 <div>
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Selected Carrier</div>
                   <h3 className="text-2xl font-black text-slate-800">{selectedCarrier.name}</h3>
                   <div className="text-xs font-bold text-slate-400 mt-1">เงินเข้าทันทีหลังจากแจ้งโอนและตรวจสอบสลิป</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {carrierPackages.length === 0 && <div className="col-span-full py-20 text-center bg-white rounded-[40px] text-slate-400 font-bold">ไม่มีแพ็กเกจในขณะนี้</div>}
                {carrierPackages.map(pkg => (
                  <div 
                    key={pkg.id}
                    onClick={() => navigate(`/summary/${pkg.id}`)}
                    className="bg-white rounded-[45px] p-8 shadow-sm border-2 border-white hover:border-blue-100 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-full"
                  >
                    <div className="space-y-3">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedCarrier.name}</div>
                      <h4 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{pkg.name}</h4>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="text-3xl font-black text-slate-900">฿{pkg.price.toLocaleString()}</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
                        <Zap size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white/40 backdrop-blur-sm rounded-[60px] p-10 border border-white flex flex-wrap justify-center gap-12 text-center">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600"><Check size={24}/></div>
           <div className="text-left">
             <div className="text-sm font-black text-slate-800">รวดเร็ว</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Automated Top-up</div>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Check size={24}/></div>
           <div className="text-left">
             <div className="text-sm font-black text-slate-800">แม่นยำ</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Direct Injection</div>
           </div>
         </div>
      </div>
    </div>
  );
};