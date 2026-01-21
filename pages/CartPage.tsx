
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../db';
import { Order } from '../types';

export const CartPage = () => {
  const { items, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    // สร้างรหัสออเดอร์รูปแบบ AT-XXXXXXXX (ตัวเลข 8 หลัก)
    const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
    const orderId = `AT-${randomDigits}`;
    
    // Create a multi-item order
    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      gameId: 'MULTI', // Placeholder for multi-item
      packageId: 'MULTI', // Placeholder
      items: items.map(i => ({
        gameId: i.gameId,
        packageId: i.packageId,
        name: i.name,
        price: i.price
      })),
      amount: cartTotal,
      status: 'PENDING',
      gameData: { note: 'Cart Checkout' }, // In a real app, might ask for game IDs per item
      isInstallment: false,
      createdAt: Date.now()
    };

    DB.saveOrder(newOrder);
    clearCart();
    navigate(`/payment/${orderId}`);
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <h1 className="text-4xl font-black text-slate-800">Shopping Cart</h1>
        <div className="bg-white/60 backdrop-blur border border-white px-6 py-2 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
          {items.length} items in cart
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-[60px] p-24 text-center shadow-xl border border-white space-y-8 animate-in zoom-in duration-500">
           <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner"><ShoppingCart size={64} /></div>
           <p className="text-slate-400 font-black text-xl">ไม่มีสินค้าในตะกร้า</p>
           <button onClick={() => navigate('/')} className="inline-block px-12 py-5 bg-blue-600 text-white rounded-full font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all">
             เลือกซื้อสินค้า
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-[40px] p-6 shadow-sm border border-white flex items-center justify-between gap-4 group hover:shadow-lg transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-[25px] overflow-hidden shrink-0 border border-slate-100">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.gameName} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.gameName}</div>
                    <div className="text-lg font-black text-slate-800">{item.name}</div>
                    <div className="text-xl font-black text-blue-600">฿{item.price}</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout Summary */}
          <div className="bg-white rounded-[50px] p-10 shadow-xl border border-white space-y-6 h-fit">
            <h2 className="text-2xl font-black text-slate-800">Summary</h2>
            <div className="space-y-3 pb-6 border-b border-slate-100">
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Subtotal</span>
                <span>฿{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-500">
                <span>Fee</span>
                <span>฿0</span>
              </div>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-800">
              <span>Total</span>
              <span>฿{cartTotal}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full py-5 bg-blue-600 text-white rounded-full font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Checkout <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};