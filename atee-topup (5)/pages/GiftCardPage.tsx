
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Search, Check, ShoppingCart } from 'lucide-react';
import { DB } from '../db';
import { Game, Package } from '../types';

export const GiftCardPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Game | null>(null);

  const games = DB.getGames();
  const packages = DB.getPackages();

  const giftCardBrands = useMemo(() => 
    games.filter(g => g.category === 'GiftCard' && g.active),
    [games]
  );

  const filteredBrands = useMemo(() => 
    giftCardBrands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())),
    [giftCardBrands, search]
  );

  const brandPackages = useMemo(() => 
    selectedBrand ? packages.filter(p => p.gameId === selectedBrand.id && p.active) : [],
    [selectedBrand, packages]
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
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">บัตรเติมเกม & Gift Card</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Top-up Gift Cards Instantly</p>
          </div>
        </div>
        
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหายี่ห้อบัตร..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-white rounded-full text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Brand Selection List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/50 backdrop-blur-sm rounded-[50px] p-8 border border-white shadow-xl space-y-4">
            <h2 className="text-xl font-black text-slate-800 px-2 flex items-center gap-3">
              <CreditCard size={20} className="text-blue-500" /> เลือกประเภทบัตร
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {filteredBrands.length === 0 && <div className="text-center py-10 text-slate-400 font-bold">ไม่พบบัตรที่ต้องการ</div>}
              {filteredBrands.map(brand => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  className={`flex items-center gap-4 p-4 rounded-[30px] transition-all border ${selectedBrand?.id === brand.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-600 border-white hover:border-blue-100 hover:shadow-md'}`}
                >
                  <img src={brand.image} className="w-12 h-12 rounded-[18px] object-cover" alt="" />
                  <div className="flex-1 text-left font-bold text-sm">{brand.name}</div>
                  {selectedBrand?.id === brand.id && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Packages / Denominations Grid */}
        <div className="lg:col-span-2">
          {!selectedBrand ? (
            <div className="h-full min-h-[400px] bg-white/30 rounded-[60px] border-4 border-dashed border-white flex flex-col items-center justify-center space-y-4 text-slate-400">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm">
                 <ShoppingCart size={32} />
               </div>
               <p className="font-bold text-lg italic">โปรดเลือกยี่ห้อบัตรเพื่อดูรายการราคา</p>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              <div className="flex items-center gap-6 p-6 bg-white/80 backdrop-blur rounded-[40px] border border-white shadow-sm">
                 <img src={selectedBrand.image} className="w-20 h-20 rounded-[30px] object-cover shadow-lg" alt="" />
                 <div>
                   <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Selected Brand</div>
                   <h3 className="text-2xl font-black text-slate-800">{selectedBrand.name}</h3>
                   <div className="text-xs font-bold text-slate-400 mt-1">สินค้าพร้อมส่งทันที รับโค้ดทางอีเมลหรือประวัติออเดอร์</div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {brandPackages.length === 0 && <div className="col-span-full py-20 text-center bg-white rounded-[40px] text-slate-400 font-bold">ไม่มีข้อมูลราคาในขณะนี้</div>}
                {brandPackages.map(pkg => (
                  <div 
                    key={pkg.id}
                    onClick={() => navigate(`/summary/${pkg.id}`)}
                    className="bg-white rounded-[45px] p-8 shadow-sm border-2 border-white hover:border-blue-100 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-full"
                  >
                    <div className="space-y-3">
                      <div className="text-xs font-black text-slate-400 uppercase tracking-widest">{selectedBrand.name}</div>
                      <h4 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">{pkg.name}</h4>
                    </div>
                    <div className="mt-8 flex items-end justify-between">
                      <div className="space-y-1">
                        <div className="text-3xl font-black text-slate-900">฿{pkg.price.toLocaleString()}</div>
                        {pkg.allowInstallment && (
                          <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase inline-block">ผ่อนชำระได้</div>
                        )}
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

      {/* Trust Badges */}
      <div className="bg-white/40 backdrop-blur-sm rounded-[60px] p-10 border border-white flex flex-wrap justify-center gap-12 text-center">
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600"><Check size={24}/></div>
           <div className="text-left">
             <div className="text-sm font-black text-slate-800">ออโต้ 100%</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Instant Code</div>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600"><Check size={24}/></div>
           <div className="text-left">
             <div className="text-sm font-black text-slate-800">ปลอดภัย</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Trusted Seller</div>
           </div>
         </div>
         <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600"><Check size={24}/></div>
           <div className="text-left">
             <div className="text-sm font-black text-slate-800">Support 24/7</div>
             <div className="text-[10px] font-bold text-slate-400 uppercase">Admin Care</div>
           </div>
         </div>
      </div>
    </div>
  );
};
