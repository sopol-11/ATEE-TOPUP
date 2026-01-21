import React, { useState } from 'react';
import { Edit3, Eye, Trash2, Check, Clock, X, ClipboardList, Image as ImageIcon } from 'lucide-react';
import { DB } from '../../db';
import { Order, Game } from '../../types';

export const AdminOrders = ({ orders, games }: { orders: Order[], games: Game[] }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewSlipImage, setViewSlipImage] = useState<string | null>(null);

  const handleUpdate = (id: string, status: any) => {
    DB.updateOrderStatus(id, status);
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter">จัดการคำสั่งซื้อ</h2>
        <div className="bg-white px-5 md:px-6 py-2 rounded-full border border-slate-100 text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
          {orders.length} TOTAL ORDERS
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-[35px] md:rounded-[50px] shadow-sm border border-white overflow-hidden">
        {/* Scrollable Wrapper - Crucial for mobile */}
        <div className="scroll-container overflow-x-auto no-scrollbar">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50/50 border-b border-slate-50">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 md:px-8 py-5 md:py-6">ID / Date</th>
                <th className="px-6 md:px-8 py-5 md:py-6">Game Info</th>
                <th className="px-6 md:px-8 py-5 md:py-6">Amount</th>
                <th className="px-6 md:px-8 py-5 md:py-6">Status</th>
                <th className="px-6 md:px-8 py-5 md:py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 md:px-8 py-6 md:py-8">
                      <div className="font-black text-slate-700 text-sm md:text-lg tracking-tight">#{order.id}</div>
                      <div className="text-[10px] font-bold text-slate-300 whitespace-nowrap">{new Date(order.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-8">
                      <div className="text-sm font-black text-slate-800">{games.find(g => g.id === order.gameId)?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 font-bold truncate max-w-[150px]">{Object.values(order.gameData).join(' | ')}</div>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-8">
                      <div className="text-base md:text-xl font-black text-blue-600">฿{order.amount.toLocaleString()}</div>
                      {order.isInstallment && <div className="text-[8px] font-black text-purple-400 uppercase">ผ่อนชำระ</div>}
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-8">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase shadow-sm ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-600' : 
                        order.status === 'SUCCESS' ? 'bg-blue-100 text-blue-600' : 
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-6 md:py-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setViewSlipImage(order.paymentSlip || null)}
                          className={`p-3 md:p-4 rounded-full transition-all shadow-inner ${order.paymentSlip ? 'bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white' : 'bg-slate-50 text-slate-200 cursor-not-allowed'}`}
                          title="ดูสลิป"
                          disabled={!order.paymentSlip}
                        >
                          <ImageIcon size={18} />
                        </button>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 md:p-4 bg-slate-50 rounded-full hover:bg-slate-900 hover:text-white transition-all text-slate-400 shadow-inner"
                          title="แก้ไขออเดอร์"
                        >
                          <Edit3 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] md:rounded-[60px] p-6 md:p-10 max-w-4xl w-full shadow-2xl animate-scale-in grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tighter">Order #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X/></button>
              </div>
              <div className="aspect-[3/4] bg-slate-100 rounded-[30px] md:rounded-[40px] overflow-hidden shadow-inner border-4 border-white relative group cursor-pointer" onClick={() => setViewSlipImage(selectedOrder.paymentSlip || null)}>
                {selectedOrder.paymentSlip ? (
                  <img src={selectedOrder.paymentSlip} className="w-full h-full object-cover" alt="slip" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                    <ImageIcon size={48} />
                    <span className="font-bold text-[10px] uppercase">NO SLIP UPLOADED</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Eye className="text-white" size={32} />
                </div>
              </div>
            </div>
            <div className="space-y-6 md:space-y-8 flex flex-col justify-center">
              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ข้อมูลการเติม</div>
                <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100 space-y-2">
                  {Object.entries(selectedOrder.gameData).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs font-bold">
                      <span className="text-slate-400 uppercase text-[9px]">{k}:</span>
                      <span className="text-slate-800 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">จัดการสถานะ</div>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={() => handleUpdate(selectedOrder.id, 'SUCCESS')} className="w-full py-4 md:py-5 bg-green-500 text-white rounded-full font-black text-base md:text-lg shadow-xl shadow-green-100 hover:scale-105 transition-all flex items-center justify-center gap-3">
                    <Check size={20}/> เติมสำเร็จ
                  </button>
                  <button onClick={() => handleUpdate(selectedOrder.id, 'PROCESSING')} className="w-full py-4 md:py-5 bg-blue-500 text-white rounded-full font-black text-base md:text-lg shadow-xl shadow-blue-100 hover:scale-105 transition-all flex items-center justify-center gap-3">
                    <Clock size={20}/> กำลังดำเนินการ
                  </button>
                  <button onClick={() => handleUpdate(selectedOrder.id, 'CANCELLED')} className="w-full py-4 md:py-5 bg-red-50 text-red-500 border-2 border-red-50 rounded-full font-black text-base md:text-lg hover:bg-red-50 transition-all">
                    ยกเลิกรายการ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {viewSlipImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setViewSlipImage(null)}>
          <div className="relative max-w-2xl w-full animate-scale-in" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setViewSlipImage(null)}
              className="absolute -top-12 right-0 p-3 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all"
            >
              <X size={24}/>
            </button>
            <img src={viewSlipImage} className="w-full h-auto max-h-[85vh] object-contain rounded-[30px] md:rounded-[40px] shadow-2xl border-4 border-white/20" alt="Slip" />
          </div>
        </div>
      )}
    </div>
  );
};