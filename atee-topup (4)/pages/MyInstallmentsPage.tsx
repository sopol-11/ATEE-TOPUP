
import React, { useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { CreditCard } from 'lucide-react';
import { DB } from '../db';
import { useAuth } from '../contexts/AuthContext';

export const MyInstallmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const allGames = useMemo(() => DB.getGames(), []);
  const allPackages = useMemo(() => DB.getPackages(), []);

  const installments = useMemo(() => {
    const all = DB.getInstallments();
    if (!user) return [];
    return all.filter(i => i.userId === user.id);
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="pt-10 pb-20 px-4 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <h1 className="text-4xl font-black text-slate-800">My Installments</h1>
      
      {installments.length === 0 ? (
        <div className="bg-white rounded-[60px] p-24 text-center shadow-xl border border-white space-y-6">
           <CreditCard className="mx-auto text-slate-100" size={80} />
           <p className="text-slate-400 font-black text-xl">คุณยังไม่มีรายการผ่อนชำระ</p>
           <button onClick={() => navigate('/')} className="px-10 py-4 bg-slate-900 text-white rounded-full font-black">เลือกดูสินค้าที่ร่วมรายการ</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {installments.map(ins => {
            const order = DB.getOrders().find(o => o.id === ins.orderId);
            const game = allGames.find(g => g.id === order?.gameId);
            const pkg = allPackages.find(p => p.id === order?.packageId);
            const progress = Math.min((ins.paidAmount / ins.totalAmount) * 100, 100);

            return (
              <div key={ins.id} className="bg-white rounded-[60px] p-10 shadow-sm border border-white space-y-8 relative overflow-hidden group hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="text-[10px] text-blue-500 font-black uppercase tracking-widest">{game?.name || 'Loading...'}</div>
                    <div className="text-2xl font-black text-slate-800">{pkg?.name || 'Package info'}</div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${progress === 100 ? 'bg-green-100 text-green-600' : 'bg-purple-100 text-purple-600'}`}>
                    {progress === 100 ? 'เสร็จสิ้น' : 'กำลังผ่อน'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>ความคืบหน้า</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-600">
                    <span>จ่ายแล้ว: ฿{ins.paidAmount.toLocaleString()}</span>
                    <span>ยอดเต็ม: ฿{ins.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                   <div className="space-y-1">
                     <div className="text-[9px] text-slate-400 font-black uppercase">งวดถัดไป</div>
                     <div className="text-sm font-black text-slate-700">ภายใน 30 วัน</div>
                   </div>
                   {progress < 100 && (
                     <button 
                       onClick={() => navigate(`/payment/${ins.orderId}?type=installment`)}
                       className="px-8 py-3 bg-blue-600 text-white rounded-full text-xs font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                     >
                       ชำระค่างวด
                     </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
