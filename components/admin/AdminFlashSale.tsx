
import React, { useState, useMemo } from 'react';
import { Zap, Package as PackageIcon, ArrowRight, Plus, Check, Save } from 'lucide-react';
import { Game, Package } from '../../types';
import { DB } from '../../db';
import { useNotification } from '../../App';

export const AdminFlashSale = ({ games }: { games: Game[] }) => {
  const { showToast } = useNotification();
  const packages = DB.getPackages();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleUpdatePackage = async (pkg: Package, updates: Partial<Package>) => {
    try {
      const updatedPkg = { ...pkg, ...updates };
      await DB.savePackage(updatedPkg);
      
      // Auto-Sync Game Status Logic
      const gameId = pkg.gameId;
      const game = games.find(g => g.id === gameId);
      
      if (game) {
        // Fetch fresh packages list including the one we just updated
        const allPackages = DB.getPackages(); 
        // Note: DB.getPackages() might return stale data immediately after save in some contexts, 
        // but here we can simulate the check or wait for subscription update. 
        // For robustness, we check if we are Enabling or Disabling.

        if (updates.isFlashSale === true) {
           // Enabling: Definitely mark game as active
           await DB.saveGame({ ...game, isFlashSale: true });
        } else if (updates.isFlashSale === false) {
           // Disabling: Check if any OTHER package is still on sale
           const otherSalePkgs = allPackages.filter(p => p.gameId === gameId && p.id !== pkg.id && p.isFlashSale && p.active);
           if (otherSalePkgs.length === 0) {
              // No other packages on sale, turn off game flag
              await DB.saveGame({ ...game, isFlashSale: false });
           }
        }
      }

      showToast('บันทึกข้อมูล Flash Sale เรียบร้อยแล้ว', 'success');
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  const flashSalePackages = packages.filter(p => p.isFlashSale && p.active);
  const availableGames = games.filter(g => g.active);

  const gamePackages = useMemo(() => 
    selectedGame ? packages.filter(p => p.gameId === selectedGame.id && p.active) : [],
    [selectedGame, packages]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Zap className="text-yellow-500" fill="currentColor"/> จัดการ Flash Sale
          </h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Manage Special Offers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Active Flash Sale Items */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-4">🔥 รายการลดราคา ({flashSalePackages.length})</h3>
          <div className="bg-orange-50 rounded-[40px] p-6 space-y-4 border border-orange-100 min-h-[300px]">
            {flashSalePackages.length === 0 && <div className="text-center py-10 text-orange-300 font-bold">ไม่มีรายการลดราคา</div>}
            {flashSalePackages.map(pkg => {
              const game = games.find(g => g.id === pkg.gameId);
              return (
                <div key={pkg.id} className="bg-white rounded-[30px] p-4 flex items-center gap-4 shadow-sm border border-orange-100 animate-slide-up relative overflow-hidden group">
                  <div className="w-12 h-12 bg-slate-50 rounded-[15px] flex items-center justify-center shrink-0">
                    <PackageIcon size={20} className="text-slate-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-black text-slate-400 uppercase truncate">{game?.name}</div>
                    <div className="font-black text-slate-800 truncate">{pkg.name}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-black">฿</span>
                        <input 
                          type="number" 
                          placeholder="Price" 
                          value={pkg.flashSalePrice || ''}
                          onBlur={(e) => handleUpdatePackage(pkg, { flashSalePrice: parseFloat(e.target.value) })}
                          onChange={(e) => {
                             // Just local UI update visually, actual save on Blur to prevent too many writes
                          }}
                          className="w-24 pl-6 pr-2 py-1 bg-slate-50 rounded-full text-xs font-bold border border-slate-200 focus:outline-none focus:border-orange-300 text-orange-600"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 line-through">฿{pkg.price}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const input = document.querySelector(`input[value="${pkg.flashSalePrice}"]`) as HTMLInputElement;
                        if(input) handleUpdatePackage(pkg, { flashSalePrice: parseFloat(input.value) });
                      }}
                      className="p-3 bg-green-50 text-green-500 rounded-full hover:bg-green-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                      title="Save Price"
                    >
                      <Save size={16}/>
                    </button>
                    <button 
                      onClick={() => handleUpdatePackage(pkg, { isFlashSale: false })}
                      className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                      title="Remove from Flash Sale"
                    >
                      <ArrowRight size={16} className="rotate-180"/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selection Area */}
        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-4">📦 เลือกสินค้าจัดรายการ</h3>
          <div className="bg-slate-50 rounded-[40px] p-6 space-y-6 border border-slate-100">
            
            {/* Step 1: Select Game */}
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">1. เลือกเกม / บริการ</label>
               <select 
                 className="w-full px-6 py-4 bg-white border border-slate-200 rounded-full font-bold text-sm focus:outline-none cursor-pointer"
                 onChange={(e) => setSelectedGame(games.find(g => g.id === e.target.value) || null)}
                 value={selectedGame?.id || ''}
               >
                 <option value="">-- เลือกเกม --</option>
                 {availableGames.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
               </select>
            </div>

            {/* Step 2: Select Package */}
            {selectedGame && (
              <div className="space-y-4 animate-fade-in">
                 <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">2. เลือกแพ็กเกจที่จะลดราคา</label>
                 <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    {gamePackages.map(pkg => (
                      <div key={pkg.id} className={`flex items-center justify-between p-4 rounded-[25px] border transition-all ${pkg.isFlashSale ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100 hover:border-blue-200'}`}>
                         <div>
                           <div className="text-sm font-black text-slate-800">{pkg.name}</div>
                           <div className="text-[10px] font-bold text-slate-400">ราคาปกติ ฿{pkg.price}</div>
                         </div>
                         {pkg.isFlashSale ? (
                           <div className="flex items-center gap-2 text-green-600 font-bold text-xs uppercase bg-white px-3 py-1 rounded-full shadow-sm">
                             <Check size={12} strokeWidth={3}/> On Sale
                           </div>
                         ) : (
                           <button 
                             onClick={() => handleUpdatePackage(pkg, { isFlashSale: true, flashSalePrice: Math.floor(pkg.price * 0.9) })}
                             className="px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase hover:bg-orange-500 transition-all flex items-center gap-2 shadow-lg"
                           >
                             <Plus size={12}/> Add
                           </button>
                         )}
                      </div>
                    ))}
                 </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};