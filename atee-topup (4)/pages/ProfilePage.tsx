
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { User as UserIcon, ChevronRight, LogOut, CreditCard, ShoppingBag, Settings, Save, X, Phone, User as UserIconSmall, Edit3 } from 'lucide-react';
import { DB } from '../db';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../App';
import { Order, Installment } from '../types';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEditName(user.displayName || user.email.split('@')[0]);
    setEditPhone(user.phoneNumber || '');

    // Subscribe to orders and installments for real-time counts
    const unsubOrders = DB.subscribe('orders', (allOrders) => {
      const userOrders = allOrders.filter(o => o.userId === user.id);
      setOrders(userOrders);
    });

    const unsubIns = DB.subscribe('installments', (allIns) => {
      const userIns = allIns.filter(i => i.userId === user.id);
      setInstallments(userIns);
      setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubIns();
    };
  }, [user]);

  if (!user) return <Navigate to="/login" />;

  const successfulOrders = orders.filter(o => o.status === 'SUCCESS' || o.status === 'PAID').length;
  const activeInstallments = installments.filter(i => i.status === 'ACTIVE').length;

  const handleSaveProfile = async () => {
    if(!user) return;
    setIsSaving(true);
    try {
      const updatedUser = {
        ...user,
        displayName: editName,
        phoneNumber: editPhone
      };
      await DB.updateUser(updatedUser);
      setIsEditing(false);
      showToast('บันทึกข้อมูลส่วนตัวสำเร็จ', 'success');
      
      // Update local storage to reflect changes immediately in UI
      localStorage.setItem('atee_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-10 md:pt-20 pb-20 px-4 max-w-2xl mx-auto space-y-10 animate-fade-in">
      <div className="bg-white rounded-[50px] md:rounded-[60px] p-8 md:p-16 shadow-2xl border border-white text-center space-y-10 relative overflow-hidden group">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-[100px] -mr-40 -mt-40 transition-all group-hover:blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-pink-50 to-orange-50 rounded-full blur-[80px] -ml-20 -mb-20 opacity-50"></div>
        
        <div className="relative">
           <div className="absolute top-0 right-0 z-10">
             <button 
                onClick={() => setIsEditing(!isEditing)}
                className={`p-3 rounded-full transition-all shadow-sm ${isEditing ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white'}`}
                title={isEditing ? 'Cancel Edit' : 'Edit Profile'}
             >
                {isEditing ? <X size={20}/> : <Settings size={20}/>}
             </button>
           </div>

          <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full mx-auto flex items-center justify-center text-slate-800 mb-6 md:mb-8 shadow-2xl border-8 border-slate-50 relative group-hover:scale-105 transition-transform duration-500">
             <div className="absolute inset-2 bg-slate-100 rounded-full animate-pulse opacity-30"></div>
             <UserIcon size={48} className="relative md:hidden" />
             <UserIcon size={64} className="relative hidden md:block" />
             {/* Status Badge */}
             <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
          </div>
          
          {isEditing ? (
             <div className="space-y-4 max-w-xs mx-auto animate-scale-in">
                <div className="relative group">
                   <UserIconSmall className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16}/>
                   <input 
                     type="text" 
                     value={editName}
                     onChange={e => setEditName(e.target.value)}
                     className="w-full pl-12 pr-4 py-3 rounded-full bg-slate-50 border border-slate-200 font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                     placeholder="Display Name"
                   />
                </div>
                <div className="relative group">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16}/>
                   <input 
                     type="tel" 
                     value={editPhone}
                     onChange={e => setEditPhone(e.target.value)}
                     className="w-full pl-12 pr-4 py-3 rounded-full bg-slate-50 border border-slate-200 font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                     placeholder="Phone Number (08x-xxx-xxxx)"
                   />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full py-3 bg-blue-600 text-white rounded-full font-black text-sm shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : <><Save size={16}/> บันทึกข้อมูล</>}
                </button>
             </div>
          ) : (
            <div className="animate-fade-in">
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{user.displayName || user.email.split('@')[0]}</h1>
              <div className="flex flex-col items-center gap-2 mt-3">
                 <div className="inline-block px-4 py-1.5 bg-slate-900 rounded-full shadow-lg">
                    <p className="text-white font-black uppercase text-[9px] tracking-[0.3em]">Member ID: {user.uid}</p>
                 </div>
                 {user.phoneNumber ? (
                   <div className="text-sm font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                     <Phone size={14}/> {user.phoneNumber}
                   </div>
                 ) : (
                   <div onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-400 cursor-pointer hover:underline flex items-center gap-1 mt-1">
                     <Edit3 size={12}/> เพิ่มเบอร์โทรศัพท์
                   </div>
                 )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 relative">
          <div 
            onClick={() => navigate('/my-orders')}
            className="p-6 md:p-10 bg-white rounded-[40px] md:rounded-[45px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group/card"
          >
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/card:scale-110 transition-transform">
              <ShoppingBag size={20} />
            </div>
            <div className="text-3xl md:text-5xl font-black text-slate-800 mb-1">{successfulOrders}</div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">คำสั่งซื้อสำเร็จ</div>
          </div>
          <div 
            onClick={() => navigate('/my-installments')}
            className="p-6 md:p-10 bg-white rounded-[40px] md:rounded-[45px] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group/card"
          >
            <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover/card:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
            <div className="text-3xl md:text-5xl font-black text-slate-800 mb-1">{activeInstallments}</div>
            <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest">รายการผ่อนชำระ</div>
          </div>
        </div>

        <div className="space-y-3 md:space-y-4 pt-6 relative text-left">
           <button 
             onClick={() => navigate('/my-orders')}
             className="w-full py-5 md:py-6 px-8 md:px-10 bg-slate-50 hover:bg-slate-100 rounded-[30px] md:rounded-[35px] font-black text-slate-700 flex items-center justify-between transition-all group border border-transparent hover:border-slate-100"
           >
             <span className="text-sm md:text-base">ประวัติการทำรายการ</span>
             <div className="p-2 bg-white rounded-full text-slate-300 group-hover:text-blue-500 transition-colors shadow-sm">
               <ChevronRight size={18} />
             </div>
           </button>
           <button 
             onClick={() => { logout(); navigate('/'); }}
             className="w-full py-5 md:py-6 px-8 md:px-10 text-rose-500 hover:bg-rose-50 rounded-[30px] md:rounded-[35px] font-black flex items-center justify-between transition-all group border border-transparent hover:border-rose-100"
           >
             <span className="text-sm md:text-base flex items-center gap-3"><LogOut size={20} /> ออกจากระบบ</span>
             <ChevronRight size={18} className="opacity-30" />
           </button>
        </div>
      </div>
    </div>
  );
};
