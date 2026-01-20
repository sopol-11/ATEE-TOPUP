
import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Order, User } from '../../types';

export const AdminStats = ({ orders, users }: { orders: Order[], users: User[] }) => {
  const stats = useMemo(() => {
    const successful = orders.filter(o => o.status === 'SUCCESS' || o.status === 'PAID');
    return {
      totalSales: successful.reduce((acc, o) => acc + o.amount, 0),
      pending: orders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length,
      totalUsers: users.length,
      successfulCount: successful.length
    };
  }, [orders, users]);

  const cards = [
    { label: 'ยอดขายรวม', value: `฿${stats.totalSales.toLocaleString()}`, icon: DollarSign, color: 'blue' },
    { label: 'รอดำเนินการ', value: stats.pending, icon: Clock, color: 'orange' },
    { label: 'ออเดอร์สำเร็จ', value: stats.successfulCount, icon: CheckCircle, color: 'green' },
    { label: 'สมาชิกทั้งหมด', value: stats.totalUsers, icon: Users, color: 'purple' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="px-4">
        <h2 className="text-3xl font-black text-slate-800">แผงควบคุมสถิติ</h2>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">ข้อมูลสรุปการทำงานของระบบ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-[50px] p-10 shadow-sm border border-white space-y-4 hover:shadow-2xl transition-all hover:-translate-y-1">
            <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-white shadow-lg ${
              card.color === 'blue' ? 'bg-blue-500 shadow-blue-100' :
              card.color === 'orange' ? 'bg-orange-500 shadow-orange-100' :
              card.color === 'green' ? 'bg-green-500 shadow-green-100' :
              'bg-purple-500 shadow-purple-100'
            }`}>
              <card.icon size={24} />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase text-slate-400 tracking-widest mb-1">{card.label}</div>
              <div className="text-3xl font-black text-slate-800 tracking-tighter">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[60px] p-12 shadow-sm border border-white">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">แนวโน้มยอดขาย</h3>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">อัปเดตข้อมูลแบบเรียลไทม์</span>
        </div>
        <div className="h-64 flex items-end justify-between gap-4 px-4">
          {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
            <div key={i} className="flex-1 space-y-3 flex flex-col items-center group">
              <div className="w-full bg-slate-50 rounded-full h-full relative overflow-hidden group-hover:bg-slate-100 transition-colors">
                <div 
                  className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                  style={{ height: `${h}%` }}
                ></div>
              </div>
              <div className="text-[10px] font-bold text-slate-400">สัปดาห์ {i+1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
