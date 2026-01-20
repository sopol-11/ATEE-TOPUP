import React, { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Tag, Clock } from 'lucide-react';
import { DB } from '../db';
import { useAuth } from '../contexts/AuthContext';

export const MyOrdersPage = () => {
  const { user } = useAuth();
  
  const allGames = useMemo(() => DB.getGames(), []);
  const allPackages = useMemo(() => DB.getPackages(), []);

  const orders = useMemo(() => {
    const all = DB.getOrders();
    if (!user) return [];
    return all.filter(o => o.userId === user.id).sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [user]);

  if (!user) return <Navigate to="/login" state={{ from: '/my-orders' }} />;

  return (
    <div className="pt-6 md:pt-10 pb-20 px-4 max-w-4xl mx-auto space-y-6 md:space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase">My Orders</h1>
        <div className="bg-white/60 backdrop-blur border border-white px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
          Showing {orders.length} transactions
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-[40px] md:rounded-[60px] p-16 md:p-24 text-center shadow-xl border border-white space-y-8 animate-scale-in">
           <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner"><ShoppingCart size={48} /></div>
           <p className="text-slate-400 font-black text-lg md:text-xl">คุณยังไม่มีประวัติการสั่งซื้อ</p>
           <Link to="/" className="inline-block px-10 py-4 bg-blue-600 text-white rounded-full font-black text-base md:text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all">ไปช้อปกันเลย!</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-[35px] md:rounded-[50px] p-5 md:p-8 shadow-sm border border-white flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 md:gap-6 group hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 md:gap-8 flex-1">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-[22px] md:rounded-[30px] overflow-hidden shrink-0 border border-slate-100 shadow-sm group-hover:shadow-md transition-shadow">
                  <img 
                    src={allGames.find(g => g.id === order.gameId)?.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=200'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    alt="game" 
                  />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[8px] md:text-[10px] text-slate-300 font-black uppercase tracking-widest">
                    <span>#{order.id}</span>
                    <span className="flex items-center gap-1 opacity-50"><Clock size={10} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-lg md:text-2xl font-black text-slate-800 tracking-tight truncate">
                    {allGames.find(g => g.id === order.gameId)?.name || 'Unknown Game'}
                  </div>
                  <div className="text-[10px] md:text-sm font-bold text-blue-500 flex items-center gap-1">
                    <Tag size={12} /> {allPackages.find(p => p.id === order.packageId)?.name || 'Custom Item'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center md:items-end justify-between md:flex-col gap-2 md:gap-1 border-t md:border-t-0 border-slate-50 pt-3 md:pt-0">
                <div className="flex flex-col md:items-end">
                  <div className="text-xl md:text-2xl font-black text-slate-800">฿{order.amount.toLocaleString()}</div>
                  <div className={`text-[8px] md:text-[9px] font-black uppercase px-3 py-1 rounded-full mt-1 inline-block text-center ${
                    order.status === 'PAID' ? 'bg-green-100 text-green-600' : 
                    order.status === 'SUCCESS' ? 'bg-blue-100 text-blue-600' : 
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {order.status}
                  </div>
                </div>
                <Link 
                  to={`/track`} 
                  onClick={() => localStorage.setItem('track_id', order.id)} 
                  className="p-3 md:p-5 bg-slate-50 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner active:scale-90"
                >
                  <ArrowRight size={18} className="md:w-[24px] md:h-[24px]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};