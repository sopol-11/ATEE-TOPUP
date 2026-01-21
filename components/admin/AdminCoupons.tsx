
import React, { useState } from 'react';
import { Plus, Trash2, Ticket, X, Save, Calendar, Tag, AlertCircle } from 'lucide-react';
import { DB } from '../../db';
import { Coupon, Game } from '../../types';
import { useNotification } from '../../App';

export const AdminCoupons = ({ coupons, games }: { coupons: Coupon[], games: Game[] }) => {
  const [editCoupon, setEditCoupon] = useState<Partial<Coupon> | null>(null);
  const { showToast } = useNotification();

  const handleSave = () => {
    if (!editCoupon?.code || !editCoupon?.discountValue) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
      return;
    }

    const c = {
      id: editCoupon.id || 'CPN-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      code: editCoupon.code.toUpperCase(),
      discountType: editCoupon.discountType || 'FIXED',
      discountValue: editCoupon.discountValue || 0,
      minAmount: editCoupon.minAmount || 0,
      maxDiscount: editCoupon.maxDiscount || 0,
      expiryDate: editCoupon.expiryDate || Date.now() + (30 * 24 * 60 * 60 * 1000),
      usageLimit: editCoupon.usageLimit || 100,
      usedCount: editCoupon.usedCount || 0,
      active: editCoupon.active !== false,
      specificGameId: editCoupon.specificGameId || ''
    } as Coupon;

    DB.saveCoupon(c);
    setEditCoupon(null);
    showToast('บันทึกคูปองสำเร็จ!', 'success');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคูปองนี้?')) {
      DB.deleteCoupon(id);
      showToast('ลบคูปองแล้ว', 'success');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">จัดการคูปอง</h2>
        <button 
          onClick={() => setEditCoupon({ active: true, discountType: 'FIXED', usageLimit: 100 })}
          className="bg-slate-900 text-white px-8 py-4 rounded-full font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all shimmer-btn"
        >
          <Plus size={18}/> สร้างคูปองใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {coupons.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-[50px] text-center text-slate-300 font-bold border-2 border-dashed border-white">
            ไม่มีโค้ดส่วนลดในขณะนี้
          </div>
        )}
        {coupons.map(coupon => (
          <div key={coupon.id} className="bg-white rounded-[50px] p-8 shadow-sm border border-white space-y-6 group hover:shadow-2xl transition-all relative overflow-hidden">
             {/* Ticket Visual Effect */}
             <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full border border-slate-100"></div>
             <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-50 rounded-full border border-slate-100"></div>

             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Tag size={20}/></div>
                   <div>
                      <div className="text-xl font-black text-slate-800 tracking-tighter">{coupon.code}</div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `฿${coupon.discountValue} OFF`}</div>
                   </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${coupon.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   {coupon.active ? 'Active' : 'Disabled'}
                </div>
             </div>

             <div className="space-y-2 p-5 bg-slate-50 rounded-[30px] border border-slate-100">
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-slate-400 uppercase">Usage:</span>
                   <span className="text-slate-700">{coupon.usedCount} / {coupon.usageLimit}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                   <span className="text-slate-400 uppercase">Expiry:</span>
                   <span className="text-slate-700">{new Date(coupon.expiryDate).toLocaleDateString()}</span>
                </div>
                {coupon.specificGameId && (
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-slate-400 uppercase">Specific Game:</span>
                    <span className="text-blue-500">{games.find(g => g.id === coupon.specificGameId)?.name || 'N/A'}</span>
                  </div>
                )}
             </div>

             <div className="flex gap-2">
                <button 
                   onClick={() => setEditCoupon(coupon)}
                   className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-full font-black text-xs hover:bg-slate-200 transition-all"
                >
                   แก้ไข
                </button>
                <button 
                   onClick={() => handleDelete(coupon.id)}
                   className="p-3 bg-red-50 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                   <Trash2 size={16}/>
                </button>
             </div>
          </div>
        ))}
      </div>

      {editCoupon && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[60px] p-10 max-w-2xl w-full shadow-2xl space-y-8 max-h-[90vh] overflow-y-auto no-scrollbar">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                 <h3 className="text-2xl font-black text-slate-800 tracking-tighter">COUPON EDITOR</h3>
                 <button onClick={() => setEditCoupon(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X/></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">โค้ดส่วนลด (CODE)</label>
                       <input 
                         type="text" 
                         value={editCoupon.code || ''} 
                         onChange={e => setEditCoupon({...editCoupon, code: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-black text-lg text-blue-600 uppercase"
                         placeholder="SAVE50"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">รูปแบบส่วนลด</label>
                       <select 
                         value={editCoupon.discountType}
                         onChange={e => setEditCoupon({...editCoupon, discountType: e.target.value as any})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm"
                       >
                          <option value="FIXED">จำนวนเงินคงที่ (฿)</option>
                          <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">มูลค่าส่วนลด</label>
                       <input 
                         type="number" 
                         value={editCoupon.discountValue || ''} 
                         onChange={e => setEditCoupon({...editCoupon, discountValue: parseFloat(e.target.value)})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">ยอดขั้นต่ำ (Min Amount)</label>
                       <input 
                         type="number" 
                         value={editCoupon.minAmount || ''} 
                         onChange={e => setEditCoupon({...editCoupon, minAmount: parseFloat(e.target.value)})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">จำกัดจำนวนใช้ (Usage Limit)</label>
                       <input 
                         type="number" 
                         value={editCoupon.usageLimit || ''} 
                         onChange={e => setEditCoupon({...editCoupon, usageLimit: parseInt(e.target.value)})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">เกมที่ร่วมรายการ (เว้นว่าง = ทั้งหมด)</label>
                       <select 
                         value={editCoupon.specificGameId || ''} 
                         onChange={e => setEditCoupon({...editCoupon, specificGameId: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-sm"
                       >
                          <option value="">ทั้งหมด (Global)</option>
                          {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <label className="flex items-center gap-3 cursor-pointer p-5 bg-slate-50 rounded-[30px] flex-1">
                    <input 
                      type="checkbox" 
                      checked={editCoupon.active} 
                      onChange={e => setEditCoupon({...editCoupon, active: e.target.checked})}
                      className="w-6 h-6 rounded-lg accent-slate-900"
                    />
                    <span className="text-sm font-black text-slate-700">เปิดใช้งานโค้ดนี้</span>
                 </label>
                 <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">วันหมดอายุ</label>
                    <input 
                       type="date" 
                       onChange={e => setEditCoupon({...editCoupon, expiryDate: new Date(e.target.value).getTime()})}
                       className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-full font-bold text-xs"
                    />
                 </div>
              </div>

              <button 
                onClick={handleSave}
                className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-xl shadow-2xl hover:bg-black hover:-translate-y-1 transition-all shimmer-btn flex items-center justify-center gap-3"
              >
                 <Save size={24}/> บันทึกการตั้งค่าโค้ดส่วนลด
              </button>
           </div>
        </div>
      )}
    </div>
  );
};