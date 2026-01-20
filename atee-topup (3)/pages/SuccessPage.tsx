
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Home, ListFilter, Star, MessageSquare } from 'lucide-react';
import { useNotification } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../db';

declare const emailjs: any;

export const SuccessPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { user } = useAuth();
  const location = useLocation();
  const orderId = location.pathname.split('/').filter(Boolean).pop();
  const order = DB.getOrders().find(o => o.id === orderId);
  const emailSentRef = useRef(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Send email via EmailJS only once per order
    if (order && user && !emailSentRef.current) {
      emailSentRef.current = true;
      const game = DB.getGames().find(g => g.id === order.gameId);
      const pkg = DB.getPackages().find(p => p.id === order.packageId);

      const templateParams = {
        to_email: user.email,
        order_id: order.id,
        amount: order.amount,
        product_name: `${game?.name || ''} - ${pkg?.name || ''}`,
        user_name: user.email.split('@')[0],
      };

      emailjs.send('service_gn4sxhn', 'template_h4uicln', templateParams)
        .then(() => {
          console.log('SUCCESS! Email confirmation sent.');
        })
        .catch((error: any) => {
          console.error('FAILED to send email confirmation...', error);
        });
    }
  }, [order, user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(orderId || '');
    showToast('คัดลอกรหัสออเดอร์แล้ว!', 'success');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !user) return;

    const game = DB.getGames().find(g => g.id === order.gameId);
    
    DB.saveReview({
      id: 'RV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      orderId: order.id,
      userId: user.id,
      userName: user.email.split('@')[0],
      gameId: order.gameId,
      gameName: game?.name || 'Unknown',
      rating,
      comment,
      createdAt: Date.now()
    });

    setSubmitted(true);
    showToast('ขอบคุณสำหรับรีวิวครับ!', 'success');
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[70vh] space-y-10 text-center animate-slide-up">
      <div className="relative">
        <div className="absolute -inset-10 bg-green-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="relative w-32 h-32 md:w-40 md:h-40 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
          <CheckCircle2 size={70} />
        </div>
      </div>
      
      <div className="space-y-4 max-w-md">
        <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">ทำรายการสำเร็จ!</h1>
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-[30px] border border-blue-100 dark:border-blue-800">
          <p className="text-slate-600 dark:text-slate-300 font-bold text-sm leading-relaxed">
            ระบบอาจใช้เวลาเติมประมาณ 10-60 นาที หรืออาจเร็วกว่านั้น หากมีปัญหาทางร้านจะติดต่อไปยัง Line<br/><br/>
            ขอแสดงความนับถือ<br/>
            <span className="text-blue-600 dark:text-blue-400 font-black">ATEE TOPUP</span>
          </p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[50px] shadow-2xl border border-white dark:border-slate-800 w-full max-w-md space-y-4">
        <div className="text-[10px] text-slate-400 uppercase tracking-[0.4em] font-bold">รหัสรายการสั่งซื้อ (ID)</div>
        <div className="text-2xl md:text-3xl font-black text-blue-600 font-mono tracking-tighter bg-blue-50 dark:bg-slate-800 py-4 rounded-[30px] shadow-inner select-all">
          {orderId}
        </div>
        <button 
          className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center justify-center gap-2 mx-auto font-black uppercase tracking-widest mt-4 transition-colors"
          onClick={handleCopy}
        >
          <ClipboardList size={14} /> คัดลอกรหัสรายการ
        </button>
      </div>

      {/* Review Section */}
      {!submitted && order && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[50px] shadow-2xl border border-white dark:border-slate-800 w-full max-w-md space-y-6">
          <div className="flex items-center gap-3 justify-center">
            <div className="p-2 bg-pink-100 text-pink-500 rounded-xl"><Star size={20} fill="currentColor" /></div>
            <h2 className="text-xl font-black text-slate-800 dark:text-white">ให้คะแนนร้านเรา</h2>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">ความพึงพอใจในการใช้บริการ</p>
          
          <div className="flex justify-center gap-2">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setRating(i)} className={`p-2 transition-all ${rating >= i ? 'text-yellow-400 scale-110' : 'text-slate-200 dark:text-slate-700'}`}>
                <Star size={32} fill={rating >= i ? "currentColor" : "none"} strokeWidth={rating >= i ? 0 : 2} />
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="เขียนรีวิวสั้นๆ ให้เราหน่อยครับ..."
              className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[30px] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900/30 transition-all min-h-[100px] text-slate-800 dark:text-white"
            />
            <button 
              type="submit"
              className="w-full py-4 bg-pink-500 text-white rounded-full font-black text-lg shadow-xl shadow-pink-100 hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare size={20} /> ส่งรีวิว
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => navigate('/my-orders')}
          className="flex-1 py-5 bg-slate-900 text-white rounded-full font-black text-lg shadow-xl hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <ListFilter size={20} /> ประวัติการเติม
        </button>
        <button 
          onClick={() => navigate('/')}
          className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-4 border-slate-50 dark:border-slate-700 rounded-full font-black text-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <Home size={20} /> กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
};
