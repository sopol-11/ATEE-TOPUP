
import React, { useState } from 'react';
import { History, CheckCircle2, Trash2, Clock, DollarSign, X, Eye, Check } from 'lucide-react';
import { DB } from '../../db';
import { Installment, Order, Game } from '../../types';
import { useDialog } from '../../contexts/DialogContext';
import { useNotification } from '../../App';

export const AdminInstallments = ({ installments, orders, games }: { installments: Installment[], orders: Order[], games: Game[] }) => {
  const [selectedIns, setSelectedIns] = useState<Installment | null>(null);
  const [confirmAmount, setConfirmAmount] = useState<string>('');
  const { showDialog } = useDialog();
  const { showToast } = useNotification();

  const handleUpdatePaidAmount = async () => {
    if (!selectedIns || !confirmAmount) return;
    const amount = parseFloat(confirmAmount);
    if (isNaN(amount)) return;

    const newPaidAmount = selectedIns.paidAmount + amount;
    const newStatus = newPaidAmount >= selectedIns.totalAmount ? 'COMPLETED' : 'ACTIVE';

    const currentHistory = selectedIns.history || [];

    await DB.updateInstallment(selectedIns.id, {
      paidAmount: newPaidAmount,
      status: newStatus,
      history: [...currentHistory, { amount, date: Date.now(), slip: "" }]
    });

    setSelectedIns(null);
    setConfirmAmount('');
    showToast('อัปเดตยอดชำระสำเร็จ!', 'success');
  };

  const handleCancelPlan = (id: string) => {
    showDialog({
      title: 'ยืนยันการยกเลิก?',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกรายการผ่อนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้',
      type: 'danger',
      confirmText: 'ยืนยันการยกเลิก',
      onConfirm: async () => {
        await DB.updateInstallment(id, { status: 'CANCELLED' });
        showToast('ยกเลิกรายการแล้ว', 'success');
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black text-slate-800">จัดการรายการผ่อน</h2>
        <div className="bg-white px-6 py-2 rounded-full border border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
          {installments.length} ACTIVE PLANS
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {installments.map(ins => {
          const order = orders.find(o => o.id === ins.orderId);
          const game = games.find(g => g.id === order?.gameId);
          const progress = (ins.paidAmount / ins.totalAmount) * 100;

          return (
            <div key={ins.id} className="bg-white rounded-[50px] p-10 border border-white shadow-sm space-y-8 relative overflow-hidden group hover:shadow-xl transition-all">
               <div className="flex justify-between items-start">
                 <div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{game?.name || 'Loading...'}</div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Plan: {ins.id}</h3>
                    <div className="text-xs font-bold text-slate-400 mt-1">Customer: {ins.userId}</div>
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${ins.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : ins.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
                   {ins.status}
                 </span>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>ความคืบหน้า</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-100">
                    <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-[25px] border border-slate-100 text-center">
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">จ่ายแล้ว</div>
                       <div className="text-xl font-black text-blue-600">฿{ins.paidAmount.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-[25px] border border-slate-100 text-center">
                       <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ยอดทั้งหมด</div>
                       <div className="text-xl font-black text-slate-800">฿{ins.totalAmount.toLocaleString()}</div>
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-slate-100 text-slate-400 rounded-full"><Clock size={16}/></div>
                     <div className="text-xs font-bold text-slate-500">ประวัติ {ins.history?.length || 0} งวด</div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedIns(ins)}
                      className="p-4 bg-slate-50 rounded-full hover:bg-slate-900 hover:text-white transition-all text-slate-400"
                      title="ยืนยันยอดชำระ"
                    >
                      <DollarSign size={18}/>
                    </button>
                    <button 
                      onClick={() => handleCancelPlan(ins.id)}
                      className="p-4 bg-slate-50 rounded-full hover:bg-red-500 hover:text-white transition-all text-slate-400"
                      title="ยกเลิกแผน"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      {selectedIns && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
           <div className="bg-white rounded-[60px] p-10 max-w-lg w-full shadow-2xl space-y-8 animate-scale-in">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="text-2xl font-black text-slate-800">Update Payment</h3>
                <button onClick={() => setSelectedIns(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X/></button>
              </div>
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 rounded-[35px] text-center">
                  <p className="text-xs font-bold text-blue-500 uppercase">ยอดค้างชำระ</p>
                  <p className="text-4xl font-black text-slate-800">฿{(selectedIns.totalAmount - selectedIns.paidAmount).toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">จำนวนเงินที่ได้รับ</label>
                   <input 
                    type="number" 
                    value={confirmAmount}
                    onChange={e => setConfirmAmount(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[35px] font-bold text-xl text-center focus:outline-none" 
                    placeholder="0.00"
                   />
                </div>
              </div>
              <button 
                onClick={handleUpdatePaidAmount}
                className="w-full py-6 bg-slate-900 text-white rounded-full font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
              >
                <Check size={24}/> ยืนยันยอดรับเงิน
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
