
import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Zap, Sparkles, X, Save, CheckCircle, Clock, Image as ImageIcon, Tags, Smartphone } from 'lucide-react';
import { DB } from '../../db';
import { Game, ApiConfig } from '../../types';

export const AdminGames = ({ games, apiConfigs }: { games: Game[], apiConfigs: ApiConfig[] }) => {
  const [editGame, setEditGame] = useState<Partial<Game> | null>(null);
  const [newType, setNewType] = useState('');

  const handleSave = () => {
    if (!editGame?.name) return;
    const g = {
      id: editGame.id || Math.random().toString(36).substr(2, 9),
      name: editGame.name || '',
      image: editGame.image || '',
      category: editGame.category || 'Mobile',
      active: editGame.active !== undefined ? editGame.active : true,
      orderIndex: editGame.orderIndex || games.length + 1,
      soldCount: editGame.soldCount || 0,
      totalStock: editGame.totalStock || 100,
      isFlashSale: editGame.isFlashSale || false,
      flashSalePrice: editGame.flashSalePrice || 0,
      flashSaleEnd: editGame.flashSaleEnd || Date.now() + 86400000,
      isNewArrival: editGame.isNewArrival || false,
      apiConfigId: editGame.apiConfigId || '',
      isVerifyEnabled: editGame.isVerifyEnabled || false,
      topupTypes: editGame.topupTypes || ['Player ID']
    } as Game;
    DB.saveGame(g);
    setEditGame(null);
  };

  const addType = () => {
    if (!newType.trim()) return;
    const currentTypes = editGame?.topupTypes || [];
    if (!currentTypes.includes(newType.trim())) {
      setEditGame({ ...editGame, topupTypes: [...currentTypes, newType.trim()] });
    }
    setNewType('');
  };

  const removeType = (typeToRemove: string) => {
    const currentTypes = editGame?.topupTypes || [];
    setEditGame({ ...editGame, topupTypes: currentTypes.filter(t => t !== typeToRemove) });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">จัดการคลังเกม</h2>
        <button 
          onClick={() => setEditGame({ active: true, isFlashSale: false, isNewArrival: false, orderIndex: games.length + 1, topupTypes: ['Player ID'] })}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-sm shadow-2xl flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={18}/> เพิ่มเกมใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {games.map(game => (
          <div key={game.id} className="bg-white rounded-[50px] p-8 shadow-sm border border-white space-y-6 group hover:shadow-2xl transition-all">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 rounded-[30px] overflow-hidden shadow-xl shrink-0 border border-slate-50">
                <img src={game.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{game.category}</div>
                <h4 className="text-xl font-black text-slate-800 leading-tight">{game.name}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {game.isFlashSale && <span className="text-[8px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1"><Zap size={8} fill="currentColor"/> FLASH SALE</span>}
                  {game.isNewArrival && <span className="text-[8px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1"><Sparkles size={8} fill="currentColor"/> NEW ARRIVAL</span>}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ขายแล้ว: {game.soldCount}</div>
              <div className="flex gap-2">
                <button onClick={() => setEditGame(game)} className="p-3 bg-slate-50 rounded-full hover:bg-blue-500 hover:text-white transition-all text-slate-400"><Edit3 size={16}/></button>
                <button className="p-3 bg-slate-50 rounded-full hover:bg-red-500 hover:text-white transition-all text-slate-400"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editGame && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[60px] p-10 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
              <h3 className="text-2xl font-black text-slate-800">ข้อมูลเกม / บริการ</h3>
              <button onClick={() => setEditGame(null)} className="p-2 text-slate-400"><X/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">รูปภาพเกม (URL)</label>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-[25px] border-2 border-dashed border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                      {editGame.image ? <img src={editGame.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                    </div>
                    <input type="text" value={editGame.image || ''} onChange={e => setEditGame({...editGame, image: e.target.value})} className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-xs" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">ชื่อบริการ</label>
                  <input type="text" value={editGame.name || ''} onChange={e => setEditGame({...editGame, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">หมวดหมู่</label>
                  <select value={editGame.category} onChange={e => setEditGame({...editGame, category: e.target.value as any})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm">
                    <option value="Mobile">Mobile (มือถือ)</option>
                    <option value="PC">PC (คอมพิวเตอร์)</option>
                    <option value="PremiumApp">Premium App (แอปพรีเมียม)</option>
                    <option value="GiftCard">Gift Card (บัตรเติมเงิน)</option>
                    <option value="MobileTopup">Mobile Topup (เติมเงิน/เน็ตมือถือ)</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest flex items-center gap-2"><Tags size={12}/> รูปแบบการเติม (Topup Types)</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-[30px] border border-slate-100">
                    {editGame.topupTypes?.map(t => (
                      <span key={t} className="bg-white px-4 py-1.5 rounded-full text-[10px] font-black text-slate-600 flex items-center gap-2 shadow-sm border border-slate-100">
                        {t} <button onClick={() => removeType(t)}><X size={10}/></button>
                      </span>
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input 
                        type="text" 
                        value={newType} 
                        onChange={e => setNewType(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addType()}
                        placeholder="เพิ่มประเภท..." 
                        className="bg-transparent border-b border-slate-200 text-[10px] font-bold focus:outline-none w-24"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 ml-4">เช่น "Player ID", "Phone Number", "Email Account"</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-orange-50 rounded-[45px] border border-orange-100 space-y-4">
                   <div className="flex items-center gap-3 mb-2">
                     <div className="p-2 bg-orange-100 text-orange-600 rounded-xl"><Zap size={20}/></div>
                     <h4 className="font-black text-slate-800 text-sm uppercase">Flash Sale Management</h4>
                   </div>
                   <label className="flex items-center gap-3 cursor-pointer bg-white p-3 rounded-full border border-orange-200 shadow-sm">
                     <input type="checkbox" checked={editGame.isFlashSale} onChange={e => setEditGame({...editGame, isFlashSale: e.target.checked})} className="w-5 h-5 rounded-lg accent-orange-500" />
                     <span className="text-xs font-bold text-orange-600 uppercase">Enable Flash Sale</span>
                   </label>
                   {editGame.isFlashSale && (
                     <div className="space-y-3 animate-in fade-in duration-300">
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Sale Price (Override Package Price)</label>
                          <input type="number" placeholder="ราคาพิเศษ" value={editGame.flashSalePrice || ''} onChange={e => setEditGame({...editGame, flashSalePrice: parseFloat(e.target.value)})} className="w-full px-6 py-3 rounded-full text-sm font-bold shadow-sm border border-orange-200 focus:outline-none" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Ends At</label>
                          <input type="datetime-local" className="w-full px-6 py-3 rounded-full text-xs font-bold shadow-sm border border-orange-200 focus:outline-none" />
                       </div>
                     </div>
                   )}
                </div>

                <div className="p-8 bg-blue-50 rounded-[45px] border border-blue-100 space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" checked={editGame.isNewArrival} onChange={e => setEditGame({...editGame, isNewArrival: e.target.checked})} className="w-5 h-5 rounded-lg accent-blue-500" />
                     <span className="text-sm font-black text-blue-600 uppercase">New Arrival Badge</span>
                  </label>
                  <div className="border-t border-blue-200 my-2"></div>
                  <label className="flex items-center gap-3 cursor-pointer">
                     <input type="checkbox" checked={editGame.isVerifyEnabled} onChange={e => setEditGame({...editGame, isVerifyEnabled: e.target.checked})} className="w-5 h-5 rounded-lg accent-blue-500" />
                     <span className="text-sm font-black text-blue-600 uppercase">Player ID Verification</span>
                  </label>
                  {editGame.isVerifyEnabled && (
                    <select 
                      value={editGame.apiConfigId || ''} 
                      onChange={e => setEditGame({...editGame, apiConfigId: e.target.value})}
                      className="w-full px-6 py-4 rounded-full text-xs font-bold shadow-sm focus:outline-none"
                    >
                      <option value="">-- เลือก API ตั้งค่า --</option>
                      {apiConfigs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <button onClick={handleSave} className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
              <Save size={24}/> บันทึกการตั้งค่าเกม
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
