
import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AlertCircle, Check, Ticket, X, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { DB } from '../db';
import { Coupon } from '../types';
import { useDialog } from '../contexts/DialogContext';

export const SummaryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const location = useLocation();
  const pkgId = location.pathname.split('/').filter(Boolean).pop();
  
  const allPackages = useMemo(() => DB.getPackages(), []);
  const allGames = useMemo(() => DB.getGames(), []);

  const pkg = allPackages.find(p => p.id === pkgId);
  const game = allGames.find(g => g.id === pkg?.gameId);
  
  const [agreed, setAgreed] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  if (!pkg || !game) return <Navigate to="/" />;

  // Effective Price Logic (Flash Sale Check)
  const isFlashSale = pkg.isFlashSale && pkg.flashSalePrice;
  const effectivePrice = isFlashSale && pkg.flashSalePrice ? pkg.flashSalePrice : pkg.price;

  const handleApplyCoupon = () => {
    setCouponError('');
    const coupons = DB.getCoupons();
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);

    if (!found) {
      setCouponError('ไม่พบโค้ดส่วนลดนี้');
      return;
    }

    if (found.expiryDate < Date.now()) {
      setCouponError('โค้ดหมดอายุแล้ว');
      return;
    }

    if (found.usedCount >= found.usageLimit) {
      setCouponError('โค้ดถูกใช้งานครบจำนวนแล้ว');
      return;
    }

    if (found.minAmount && effectivePrice < found.minAmount) {
      setCouponError(`ยอดขั้นต่ำคือ ฿${found.minAmount}`);
      return;
    }

    if (found.specificGameId && found.specificGameId !== game.id) {
      setCouponError('โค้ดนี้ใช้ไม่ได้กับเกมนี้');
      return;
    }

    setActiveCoupon(found);
    setCouponCode('');
  };

  const discountAmount = activeCoupon 
    ? (activeCoupon.discountType === 'PERCENT' 
        ? Math.min((effectivePrice * activeCoupon.discountValue) / 100, activeCoupon.maxDiscount || Infinity)
        : activeCoupon.discountValue)
    : 0;

  const finalTotal = Math.max(effectivePrice - discountAmount, 0);

  const handleProceed = (type: 'BUY' | 'INSTALL') => {
    if (!agreed) {
      showDialog({
        title: 'ยังไม่ได้ยอมรับเงื่อนไข',
        message: 'กรุณาอ่านและกดยอมรับเงื่อนไขการใช้บริการก่อนดำเนินการต่อครับ',
        type: 'warning',
        confirmText: 'ตกลง',
        showCancel: false
      });
      return;
    }
    
    if (!user) {
      navigate('/login', { state: { from: `/summary/${pkgId}` } });
      return;
    }
    const couponParams = activeCoupon ? `&couponId=${activeCoupon.id}&discount=${discountAmount}` : '';
    navigate(`/form/${pkgId}?type=${type}${couponParams}`);
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[60px] p-10 md:p-12 shadow-2xl border border-white space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-slate-800">สรุปคำสั่งซื้อ</h1>
          <p className="text-slate-400 text-sm font-medium">โปรดตรวจสอบรายละเอียดให้ถูกต้อง</p>
        </div>

        <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[40px] border border-slate-100 relative overflow-hidden">
          {isFlashSale && (
             <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-[20px] z-10 uppercase tracking-widest flex items-center gap-1">
               <Zap size={10} fill="currentColor"/> Flash Sale
             </div>
          )}
          <img src={game.image} className="w-20 h-20 rounded-[30px] object-cover shadow-lg" alt={game.name} />
          <div className="flex-1">
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{game.name}</div>
            <div className="text-xl font-black text-slate-800">{pkg.name}</div>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-black ${isFlashSale ? 'text-red-500' : 'text-blue-600'}`}>฿{effectivePrice}</div>
              {isFlashSale && <div className="text-xs font-bold text-slate-400 line-through">฿{pkg.price}</div>}
            </div>
          </div>
        </div>

        {/* Coupon Input */}
        <div className="space-y-3">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Coupon Code</div>
          {!activeCoupon ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  placeholder="กรอกโค้ดส่วนลด"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-full border border-slate-100 font-bold focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
              <button 
                onClick={handleApplyCoupon}
                className="px-8 py-4 bg-slate-900 text-white rounded-full font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                ใช้โค้ด
              </button>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-full border border-green-100 flex items-center justify-between px-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 text-white rounded-full"><Check size={14} /></div>
                <div>
                  <div className="text-xs font-black text-green-600 uppercase">โค้ดส่วนลด {activeCoupon.code}</div>
                  <div className="text-[10px] font-bold text-green-500">ลดราคา ฿{discountAmount}</div>
                </div>
              </div>
              <button onClick={() => setActiveCoupon(null)} className="p-2 hover:bg-green-100 rounded-full text-green-400 transition-all">
                <X size={16} />
              </button>
            </div>
          )}
          {couponError && <p className="text-[10px] font-bold text-red-500 ml-4">{couponError}</p>}
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50">
           <div className="flex justify-between text-sm font-bold text-slate-500 px-4">
             <span>ราคาสินค้า</span>
             <span>฿{effectivePrice}</span>
           </div>
           {activeCoupon && (
             <div className="flex justify-between text-sm font-bold text-green-500 px-4">
               <span>ส่วนลด</span>
               <span>-฿{discountAmount}</span>
             </div>
           )}
           <div className="flex justify-between text-xl font-black text-slate-800 px-4">
             <span>ยอดชำระสุทธิ</span>
             <span className="text-2xl text-blue-600">฿{finalTotal}</span>
           </div>
           
           {/* Terms & Conditions */}
           <div className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100/50 space-y-3">
             <div className="flex items-center gap-2 font-black text-blue-600 uppercase tracking-tighter"><AlertCircle size={14} /> ข้อตกลงและเงื่อนไขการใช้บริการ (Terms & Conditions)</div>
             <div className="text-[10px] text-slate-500 leading-relaxed h-32 overflow-y-auto pr-2 custom-scrollbar space-y-2">
               <p><strong>1. การให้บริการ</strong><br/>เว็บไซต์ ATEE TOPUP ให้บริการเติมเกมและบริการที่เกี่ยวข้องตามรายการที่แสดงบนเว็บไซต์เท่านั้น ผู้ใช้ต้องกรอกข้อมูลให้ถูกต้อง ครบถ้วน หากข้อมูลผิดพลาดทางร้านขอสงวนสิทธิ์ไม่รับผิดชอบในทุกกรณี</p>
               <p><strong>2. การชำระเงิน</strong><br/>2.1 การซื้อแบบชำระเต็มจำนวน ผู้ใช้ต้องชำระเงินตามยอดที่ระบุภายในเวลาที่กำหนด หากไม่ชำระภายในเวลาที่ระบบกำหนด ออเดอร์จะถูกยกเลิกโดยอัตโนมัติ<br/>2.2 การซื้อแบบผ่อนชำระ การผ่อนชำระเป็นการตกลงชำระเงินเป็นงวดตามเงื่อนไขที่ร้านกำหนด ผู้ใช้จะยังไม่ได้รับสินค้าหรือบริการจนกว่าจะชำระครบตามจำนวนที่กำหนด หากผู้ใช้ไม่ชำระตามงวด หรือผิดเงื่อนไข ร้านขอสงวนสิทธิ์ยกเลิกออเดอร์โดยไม่คืนเงินที่ชำระมาแล้ว</p>
               <p><strong>3. การอัปโหลดสลิป</strong><br/>ผู้ใช้ต้องอัปโหลดหลักฐานการชำระเงินที่ถูกต้องและชัดเจน ห้ามใช้สลิปปลอม แก้ไข หรือนำสลิปของผู้อื่นมาใช้ หากตรวจพบการทุจริต ร้านขอสงวนสิทธิ์ยกเลิกออเดอร์และระงับการใช้งานทันที</p>
               <p><strong>4. การยกเลิก / คืนเงิน</strong><br/>เมื่อผู้ใช้ดำเนินการสั่งซื้อและชำระเงินแล้ว ทางร้านขอสงวนสิทธิ์ไม่คืนเงินในทุกกรณี ยกเว้นกรณีที่เกิดจากความผิดพลาดของระบบหรือร้านค้าเท่านั้น</p>
               <p><strong>5. ความล่าช้าและปัญหาทางเทคนิค</strong><br/>ในกรณีที่เกิดความล่าช้าเนื่องจากระบบเกม ระบบผู้ให้บริการ หรือเหตุสุดวิสัย ทางร้านขอสงวนสิทธิ์ในการเลื่อนการให้บริการโดยไม่ถือเป็นความผิดของร้าน</p>
               <p><strong>6. สิทธิ์ของร้านค้า</strong><br/>ร้านขอสงวนสิทธิ์ในการ: - ปฏิเสธการให้บริการ - ยกเลิกออเดอร์ - ระงับบัญชีผู้ใช้ หากพบว่าผู้ใช้มีพฤติกรรมทุจริต ผิดเงื่อนไข หรือกระทำการที่ก่อให้เกิดความเสียหายต่อร้าน</p>
               <p><strong>7. การเปลี่ยนแปลงข้อตกลง</strong><br/>ร้านขอสงวนสิทธิ์ในการแก้ไขหรือเปลี่ยนแปลงข้อตกลงโดยไม่ต้องแจ้งให้ทราบล่วงหน้า ผู้ใช้ควรตรวจสอบข้อตกลงทุกครั้งก่อนทำรายการ</p>
             </div>
           </div>
        </div>

        <label className="flex items-center gap-4 cursor-pointer group p-5 bg-slate-50 rounded-[30px] transition-all hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100">
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${agreed ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-200'}`}>
            {agreed && <Check size={14} className="text-white" />}
            <input type="checkbox" className="hidden" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          </div>
          <span className="text-sm font-bold text-slate-600 select-none">ฉันยอมรับเงื่อนไขและข้อตกลง</span>
        </label>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => handleProceed('BUY')}
            className={`w-full py-5 rounded-full font-black text-xl shadow-xl transition-all ${agreed ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1' : 'bg-slate-100 text-slate-300'}`}
          >
            ซื้อปกติ (ชำระเต็ม)
          </button>
          {pkg.allowInstallment && (
            <button 
              onClick={() => handleProceed('INSTALL')}
              className={`w-full py-5 rounded-full font-black text-xl border-4 transition-all ${agreed ? 'border-purple-400 text-purple-600 hover:bg-purple-50' : 'border-slate-100 text-slate-200'}`}
            >
              ผ่อนชำระ (ไม่มีเงินดาวน์)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
