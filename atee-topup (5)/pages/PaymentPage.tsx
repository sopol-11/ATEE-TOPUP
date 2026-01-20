
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Clock, Upload, Check, Smartphone, CreditCard, ShieldCheck, Loader2, AlertCircle, Copy, Download, QrCode, ArrowRight } from 'lucide-react';
import { DB } from '../db';
import { useNotification } from '../App';
import { useDialog } from '../contexts/DialogContext';
import { Order } from '../types';

export const PaymentPage = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { showDialog } = useDialog();
  const location = useLocation();
  const orderId = location.pathname.split('/').filter(Boolean).pop();
  
  // State to hold order data (either from DB or LocalStorage)
  const [order, setOrder] = useState<Order | null>(null);
  const settings = DB.getSettings();

  const [paymentMethod, setPaymentMethod] = useState<'PROMPTPAY' | 'TRUEMONEY'>('PROMPTPAY');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    
    // 1. Try to find order in DB first (if user returns to page)
    const dbOrder = DB.getOrders().find(o => o.id === orderId);
    if (dbOrder) {
      setOrder(dbOrder);
    } else {
      // 2. If not in DB, look for temporary order in LocalStorage
      const tempOrderStr = localStorage.getItem(`temp_order_${orderId}`);
      if (tempOrderStr) {
        setOrder(JSON.parse(tempOrderStr));
      }
    }

    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [orderId]);

  if (!orderId) return <Navigate to="/" />;
  if (!order) return <div className="p-20 text-center text-slate-400 font-bold">Loading Order Details...</div>;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('คัดลอกลงคลิปบอร์ดแล้ว', 'success');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('ขนาดไฟล์ต้องไม่เกิน 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processPayment = async () => {
    setIsVerifying(true);
    
    try {
      // 1. Ensure order is saved to Firestore (if it was a temp order)
      // This is where we commit the data to the DB
      await DB.saveOrder(order);
      
      // Clean up temp data from LocalStorage
      localStorage.removeItem(`temp_order_${order.id}`);

      // 2. Update status based on verification settings
      if (settings.isSlipVerifyEnabled) {
        const result = await DB.verifySlip(selectedFile!, order.amount, settings);
        
        if (result.success) {
          await DB.updateOrderStatus(orderId!, 'SUCCESS', 'ชำระเงินสำเร็จ (ตรวจสอบอัตโนมัติ)', result.data);
          showToast('ชำระเงินสำเร็จ! ระบบกำลังดำเนินการเติมเงินให้คุณ', 'success');
          navigate(`/success/${orderId}`);
        } else {
          await DB.updateOrderStatus(orderId!, 'WAITING_REVIEW', 'ตรวจสอบอัตโนมัติไม่ผ่าน (แอดมินกำลังตรวจสอบ)');
          showToast('ไม่สามารถตรวจสอบอัตโนมัติได้ แอดมินจะตรวจสอบให้อีกครั้งใน 5-10 นาที', 'warning');
          navigate(`/success/${orderId}`);
        }
      } else {
        // Manual verification flow
        const updateData: Partial<Order> = {
            status: 'PAID',
            paymentSlip: selectedFile || undefined,
            paymentMethod: paymentMethod
        };
        // Update the order we just saved
        await DB.updateOrderStatus(orderId!, 'PAID', 'รอแอดมินตรวจสอบสลิป', undefined); 
        // Need to save slip image too (in a real app, upload to storage, here we use base64 in order doc for simplicity in this demo structure)
        // Re-saving order with slip for demo purposes since updateOrderStatus only does partial
        await DB.saveOrder({ ...order, ...updateData });

        showToast('แจ้งโอนสำเร็จ! แอดมินจะดำเนินการในเร็วๆ นี้', 'success');
        navigate(`/success/${orderId}`);
      }
    } catch (e) {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedFile) {
      showToast('กรุณาอัปโหลดสลิปเพื่อยืนยันการชำระเงิน', 'error');
      return;
    }

    showDialog({
      title: 'ยืนยันยอดเงินที่โอน?',
      message: `คุณได้โอนเงินจำนวน ฿${order.amount.toLocaleString()} ถูกต้องตามยอดที่กำหนดแล้วใช่หรือไม่? หากยอดไม่ตรงระบบอาจจะไม่เติมเงินอัตโนมัติ`,
      type: 'info',
      confirmText: 'ใช่ ยอดเงินถูกต้อง',
      cancelText: 'ตรวจสอบอีกครั้ง',
      onConfirm: processPayment
    });
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-white rounded-[50px] p-8 md:p-12 shadow-2xl border border-white space-y-8 relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-50 pb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-800">ชำระเงิน</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Order: {orderId}</p>
          </div>
          <div className="flex items-center gap-4 bg-rose-50 px-6 py-3 rounded-full border border-rose-100">
            <Clock className="text-rose-500 animate-pulse" size={20} />
            <div className="text-rose-600 font-black text-xl">{formatTime(timeLeft)}</div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[40px] p-10 text-center space-y-2 shadow-xl shadow-slate-200 group transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">ยอดเงินที่ต้องโอน</p>
          <div className="text-5xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform">
            ฿{order.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="flex p-2 bg-slate-50 rounded-full gap-2">
          <button 
            onClick={() => setPaymentMethod('PROMPTPAY')}
            className={`flex-1 py-4 rounded-full font-black text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all ${paymentMethod === 'PROMPTPAY' ? 'bg-white shadow-md text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <QrCode size={18} /> PROMPTPAY
          </button>
          <button 
            onClick={() => setPaymentMethod('TRUEMONEY')}
            className={`flex-1 py-4 rounded-full font-black text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all ${paymentMethod === 'TRUEMONEY' ? 'bg-white shadow-md text-orange-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Smartphone size={18} /> TRUEMONEY
          </button>
        </div>

        <div className="animate-scale-in">
          {paymentMethod === 'PROMPTPAY' ? (
            <div className="flex flex-col items-center space-y-8 py-4">
              <div className="bg-white p-6 rounded-[40px] shadow-lg border-4 border-slate-50 relative group hover:rotate-2 transition-transform">
                <img 
                  src={`https://promptpay.io/${settings.promptPayId}/${order.amount}.png`} 
                  className="w-64 h-64 object-contain" 
                  alt="PromptPay QR" 
                />
                <div className="absolute top-2 right-2">
                  <div className="bg-blue-600 text-white p-2.5 rounded-full shadow-lg">
                    <QrCode size={16} />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="text-xl font-black text-slate-800">{settings.promptPayName}</div>
                <div className="flex items-center justify-center gap-3 bg-slate-50 px-6 py-2.5 rounded-full border border-slate-100">
                  <span className="font-mono text-lg font-black text-slate-600">{settings.promptPayId}</span>
                  <button onClick={() => handleCopy(settings.promptPayId)} className="text-blue-500 hover:scale-125 transition-transform"><Copy size={16}/></button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-8 py-10">
              <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-[35px] flex items-center justify-center shadow-inner animate-float">
                <Smartphone size={48} />
              </div>
              <div className="text-center space-y-5">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">โอนเข้าวอลเล็ต</p>
                  <div className="text-4xl font-black text-slate-800 tracking-tighter">{settings.truemoneyPhone}</div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ชื่อบัญชี</p>
                  <div className="text-xl font-black text-orange-500">{settings.truemoneyName}</div>
                </div>
                <button 
                  onClick={() => handleCopy(settings.truemoneyPhone)}
                  className="px-8 py-3.5 bg-orange-500 text-white rounded-full font-black text-sm shadow-xl shadow-orange-100 hover:scale-105 transition-all flex items-center gap-2 mx-auto shimmer-btn"
                >
                  <Copy size={16} /> คัดลอกเบอร์วอลเล็ต
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 pt-10 border-t border-slate-50">
          <div className="text-center">
            <h3 className="text-lg font-black text-slate-800">ยืนยันการโอนเงิน</h3>
            <p className="text-slate-400 text-xs font-bold">กรุณาอัปโหลดสลิปที่มียอดเงินตรงกับยอดข้างต้น</p>
          </div>

          <label className="block w-full cursor-pointer group">
            <div className={`border-4 border-dashed rounded-[45px] p-10 flex flex-col items-center justify-center transition-all relative overflow-hidden ${selectedFile ? 'border-green-200 bg-green-50' : 'border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50/30'}`}>
              
              {isVerifying && selectedFile && (
                <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center">
                  <div className="scanning-line"></div>
                  <div className="bg-white/90 px-6 py-2 rounded-full shadow-lg text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] animate-pulse">
                    Scanning Receipt...
                  </div>
                </div>
              )}

              {selectedFile ? (
                <div className="relative w-full flex flex-col items-center">
                  <img src={selectedFile} className="h-48 rounded-3xl shadow-2xl mb-6 border-4 border-white" alt="slip" />
                  <div className="bg-green-500 text-white px-8 py-2.5 rounded-full text-xs font-black shadow-lg flex items-center gap-2">
                    <Check size={14} /> เลือกรูปสลิปแล้ว
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-white rounded-[30px] flex items-center justify-center text-slate-300 mb-4 shadow-sm group-hover:text-blue-500 group-hover:scale-110 transition-all">
                    <Upload size={32} />
                  </div>
                  <span className="text-sm font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">คลิกเพื่อเลือกไฟล์สลิป</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isVerifying} />
          </label>
        </div>

        <button 
          onClick={handleConfirm}
          disabled={!selectedFile || isVerifying}
          className={`w-full py-6 rounded-full font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 shimmer-btn ${!selectedFile || isVerifying ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-black hover:-translate-y-1'}`}
        >
          {isVerifying ? (
            <>
              <Loader2 size={24} className="animate-spin" /> กำลังประมวลผล...
            </>
          ) : (
            <>
              ยืนยันการชำระเงิน <ArrowRight size={24} />
            </>
          )}
        </button>

        {settings.isSlipVerifyEnabled && (
          <div className="flex items-center justify-center gap-2 text-slate-400">
             <ShieldCheck size={16}/>
             <span className="text-[10px] font-black uppercase tracking-widest">ระบบตรวจสอบสลิปอัตโนมัติเปิดใช้งาน</span>
          </div>
        )}
      </div>
    </div>
  );
};
