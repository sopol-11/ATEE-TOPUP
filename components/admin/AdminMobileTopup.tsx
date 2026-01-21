
import React, { useState } from 'react';
import { Smartphone, Plus, Trash2, Edit3, Save, X, Signal } from 'lucide-react';
import { DB } from '../../db';
import { Game, Package } from '../../types';
import { useNotification } from '../../App';

export const AdminMobileTopup = ({ games, packages }: { games: Game[], packages: Package[] }) => {
  const { showToast } = useNotification();
  const [editCarrier, setEditCarrier] = useState<Partial<Game> | null>(null);
  const [editPlan, setEditPlan] = useState<Partial<Package> | null>(null);

  const carriers = games.filter(g => g.category === 'MobileTopup');

  const handleSaveCarrier = () => {
    if (!editCarrier?.name) return;
    const g: Game = {
      id: editCarrier.id || Math.random().toString(36).substr(2, 9),
      name: editCarrier.name,
      image: editCarrier.image || '',
      category: 'MobileTopup',
      active: true,
      orderIndex: editCarrier.orderIndex || 99,
      soldCount: editCarrier.soldCount || 0,
      totalStock: 9999,
      isFlashSale: false,
      isNewArrival: false,
      isVerifyEnabled: false,
      topupTypes: ['Phone Number']
    };
    DB.saveGame(g);
    setEditCarrier(null);
    showToast('บันทึกเครือข่ายเรียบร้อย', 'success');
  };

  const handleSavePlan = () => {
    if (!editPlan?.name || !editPlan?.gameId) return;
    const p: Package = {
      id: editPlan.id || Math.random().toString(36).substr(2, 9),
      gameId: editPlan.gameId,
      name: editPlan.name,
      price: editPlan.price || 0,
      allowInstallment: false,
      active: true
    };
    DB.savePackage(p);
    setEditPlan(null);
    showToast('บันทึกแผนเติมเงินเรียบร้อย', 'success');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
          <Smartphone size={28} className="text-green-500"/> Mobile Topup Manager
        </h2>
        <button 
          onClick={() => setEditCarrier({})} 
          className="bg-slate-900 text-white px-6 py-3 rounded-full font-black text-xs shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={16}/> เพิ่มเครือข่าย
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {carriers.map(carrier => {
          const plans = packages.filter(p => p.gameId === carrier.id && p.active);
          return (
            <div key={carrier.id} className="bg-white rounded-[40px] p-6 shadow-sm border border-white space-y-4 relative overflow-hidden group">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-[20px] overflow-hidden bg-slate-50 border border-slate-100">
                     <img src={carrier.image} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div>
                     <h4 className="font-black text-slate-800 text-lg">{carrier.name}</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">{plans.length} Plans Active</p>
                   </div>
                 </div>
                 <button onClick={() => setEditCarrier(carrier)} className="p-2 text-slate-300 hover:text-blue-500"><Edit3 size={16}/></button>
               </div>

               <div className="space-y-2 bg-slate-50 rounded-[25px] p-4 max-h-[200px] overflow-y-auto custom-scrollbar">
                 {plans.map(plan => (
                   <div key={plan.id} className="flex justify-between items-center text-xs font-bold bg-white p-3 rounded-xl shadow-sm">
                     <span className="text-slate-600">{plan.name}</span>
                     <span className="text-slate-900">฿{plan.price}</span>
                   </div>
                 ))}
                 <button 
                   onClick={() => setEditPlan({ gameId: carrier.id })}
                   className="w-full py-2 text-[10px] font-black text-blue-500 uppercase flex items-center justify-center gap-1 hover:bg-blue-50 rounded-lg transition-all"
                 >
                   <Plus size={10}/> Add Plan
                 </button>
               </div>
            </div>
          );
        })}
      </div>

      {/* Edit Carrier Modal */}
      {editCarrier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] p-8 max-w-md w-full shadow-2xl space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800">จัดการเครือข่าย</h3>
               <button onClick={() => setEditCarrier(null)}><X className="text-slate-400"/></button>
             </div>
             <div className="space-y-4">
               <input type="text" placeholder="ชื่อเครือข่าย (เช่น AIS, DTAC)" value={editCarrier.name || ''} onChange={e => setEditCarrier({...editCarrier, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-full font-bold text-sm" />
               <input type="text" placeholder="URL รูปภาพโลโก้" value={editCarrier.image || ''} onChange={e => setEditCarrier({...editCarrier, image: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-full font-bold text-sm" />
             </div>
             <button onClick={handleSaveCarrier} className="w-full py-4 bg-slate-900 text-white rounded-full font-black text-sm">บันทึก</button>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[50px] p-8 max-w-md w-full shadow-2xl space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800">เพิ่มแผนเติมเงิน</h3>
               <button onClick={() => setEditPlan(null)}><X className="text-slate-400"/></button>
             </div>
             <div className="space-y-4">
               <input type="text" placeholder="ชื่อแพ็กเกจ (เช่น 50 บาท)" value={editPlan.name || ''} onChange={e => setEditPlan({...editPlan, name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 rounded-full font-bold text-sm" />
               <input type="number" placeholder="ราคา (บาท)" value={editPlan.price || ''} onChange={e => setEditPlan({...editPlan, price: parseFloat(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 rounded-full font-bold text-sm" />
             </div>
             <button onClick={handleSavePlan} className="w-full py-4 bg-green-500 text-white rounded-full font-black text-sm">เพิ่มรายการ</button>
          </div>
        </div>
      )}
    </div>
  );
};