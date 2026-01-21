
import React, { useState, useMemo } from 'react';
import { History, CheckCircle2, X } from 'lucide-react';
import { DB } from '../db';
import { Order } from '../types';

export const TrackPage = () => {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  const allGames = useMemo(() => DB.getGames(), []);
  const allPackages = useMemo(() => DB.getPackages(), []);

  const handleSearch = () => {
    if(!orderId) return;
    const orders = DB.getOrders();
    const found = orders.find(o => o.id === orderId);
    setResult(found || null);
    setSearched(true);
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-2xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-slate-800">Track Order</h1>
        <p className="text-slate-400 font-bold">เช็คสถานะการเติมเงินได้ทันที</p>
      </div>

      <div className="bg-white rounded-[50px] p-3 shadow-2xl flex gap-3 border border-white max-w-lg mx-auto">
        <input 
          type="text" 
          placeholder="กรอกรหัสออเดอร์ของคุณ..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value.toUpperCase())}
          className="flex-1 bg-transparent px-8 py-3 focus:outline-none text-slate-900 font-black text-lg placeholder:text-slate-300"
        />
        <button 
          onClick={handleSearch}
          className="px-10 bg-blue-600 text-white rounded-[40px] font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          ค้นหา
        </button>
      </div>

      {searched && (
        result ? (
          <div className="bg-white rounded-[60px] p-10 md:p-14 shadow-2xl border border-white space-y-10 animate-in slide-in-from-bottom-4 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5"><History size={180} /></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-slate-50 pb-8">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Current Status</div>
                <div className="flex items-center gap-4 text-orange-500 font-black text-4xl">
                   <div className="w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
                   {result.status}
                </div>
              </div>
              <div className="md:text-right">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Transaction ID</div>
                <div className="text-2xl font-black text-slate-700">{result.id}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="p-8 bg-slate-50 rounded-[45px] space-y-2 border border-slate-100 shadow-inner">
                 <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Game / Product</div>
                 <div className="text-xl font-black text-slate-800">{allGames.find(g => g.id === result.gameId)?.name || 'Unknown Game'}</div>
                 <div className="text-sm font-bold text-blue-500">{allPackages.find(p => p.id === result.packageId)?.name || 'Custom Package'}</div>
               </div>
               <div className="p-8 bg-slate-50 rounded-[45px] space-y-2 border border-slate-100 shadow-inner">
                 <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Player Info</div>
                 {Object.entries(result.gameData).map(([k, v]) => (
                   <div key={k} className="text-sm font-black text-slate-700">{v}</div>
                 ))}
               </div>
            </div>

            <div className="p-10 bg-blue-50/50 rounded-[50px] border border-blue-100 flex items-start gap-6 relative">
              <div className="p-4 bg-white rounded-full text-blue-500 shadow-xl shadow-blue-100/50 shrink-0"><CheckCircle2 size={32} /></div>
              <div className="space-y-2">
                <div className="text-[10px] text-blue-500 font-black uppercase tracking-[0.3em]">Admin Message</div>
                <div className="text-xl font-black text-slate-700 italic">"{result.adminNote || 'ระบบได้รับสลิปแล้ว กำลังส่งของให้ใน 5 นาทีครับ'}"</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[50px] p-20 text-center shadow-2xl border border-white space-y-6 max-w-lg mx-auto animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6"><X size={48} /></div>
             <div className="text-2xl font-black text-slate-800">ไม่พบออเดอร์นี้</div>
             <p className="text-slate-400 font-medium">โปรดตรวจสอบรหัสออเดอร์ให้ถูกต้องอีกครั้ง</p>
             <button onClick={() => setSearched(false)} className="px-8 py-3 bg-slate-100 rounded-full text-xs font-black text-slate-600 hover:bg-slate-200 transition-all">ลองใหม่</button>
          </div>
        )
      )}
    </div>
  );
};
