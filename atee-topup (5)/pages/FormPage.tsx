
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { ShieldCheck, Search, Loader2, AlertCircle, ArrowRight, CheckCircle2, User, Ticket } from 'lucide-react';
import { DB } from '../db';
import { useAuth } from '../contexts/AuthContext';
import { Order, FormField } from '../types';

export const FormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const pkgId = location.pathname.split('/').filter(Boolean).pop();
  
  const pkg = useMemo(() => DB.getPackages().find(p => p.id === pkgId), [pkgId]);
  const game = useMemo(() => DB.getGames().find(g => g.id === pkg?.gameId), [pkg]);
  
  const [selectedType, setSelectedType] = useState<string>('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [ign, setIgn] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  // Initialize selected type
  useEffect(() => {
    if (game?.topupTypes?.length && !selectedType) {
      setSelectedType(game.topupTypes[0]);
    }
  }, [game, selectedType]);

  // Load fields and initialize formData with Auto-fill
  useEffect(() => {
    if (game) {
      const forms = DB.getForms();
      const gameForm = forms.find(f => f.gameId === game.id);
      
      let targetFields: FormField[] = [];
      if (gameForm && gameForm.fields && gameForm.fields.length > 0) {
        targetFields = gameForm.fields;
      } else {
        targetFields = [{ id: 'account_id', label: 'ไอดีผู้ใช้ / ข้อมูลการเติม', type: 'text', required: true, placeholder: 'กรอกข้อมูลที่นี่' }];
      }

      setFields(targetFields);
      
      setFormData(prev => {
        const newData = { ...prev };
        targetFields.forEach(f => {
          if (newData[f.id] === undefined) {
            // Auto-fill Logic
            if (user) {
              const label = f.label.toLowerCase();
              const id = f.id.toLowerCase();
              
              if ((label.includes('line') || id.includes('line')) && user.lineId) {
                newData[f.id] = user.lineId;
              } else if ((label.includes('phone') || label.includes('เบอร์') || id.includes('phone')) && user.phoneNumber) {
                newData[f.id] = user.phoneNumber;
              } else {
                newData[f.id] = '';
              }
            } else {
              newData[f.id] = '';
            }
          }
        });
        return newData;
      });
    }
  }, [game, user]);

  if (!pkg || !game) return <Navigate to="/" />;

  const handleVerify = async () => {
    const mainId = formData[fields[0]?.id];
    if (!mainId) return;

    setIsVerifying(true);
    setVerifyError(null);
    setIgn(null);

    try {
      const result = await DB.verifyPlayerId(game.id, mainId);
      if (result) {
        setIgn(result);
      } else {
        setVerifyError("ไม่พบข้อมูลผู้เล่น โปรดตรวจสอบความถูกต้องของไอดี");
      }
    } catch (e) {
      setVerifyError("เกิดข้อผิดพลาดในการตรวจสอบ");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validation
    const missingFields = fields.filter(f => f.required && !formData[f.id]);
    if (missingFields.length > 0) {
      alert(`กรุณากรอกข้อมูลในช่องที่จำเป็น (*): ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000).toString();
      const orderId = `AT-${randomDigits}`;

      const couponId = params.get('couponId');
      const discount = parseFloat(params.get('discount') || '0');

      // Calculate Amount using Flash Sale Logic
      const isFlashSale = pkg.isFlashSale && pkg.flashSalePrice;
      const effectivePrice = isFlashSale && pkg.flashSalePrice ? pkg.flashSalePrice : pkg.price;
      const finalPrice = Math.max(effectivePrice - discount, 0);

      const newOrder: Order = {
        id: orderId,
        userId: user?.id,
        gameId: game.id,
        packageId: pkg.id,
        topupType: selectedType,
        amount: finalPrice,
        discountAmount: discount > 0 ? discount : undefined,
        couponId: couponId || undefined,
        status: 'PENDING',
        gameData: { ...formData, topup_type: selectedType },
        isInstallment: params.get('type') === 'INSTALL',
        createdAt: Date.now(),
        ign: ign || ""
      };

      localStorage.setItem(`temp_order_${orderId}`, JSON.stringify(newOrder));
      
      setTimeout(() => {
        navigate(`/payment/${orderId}${location.search}`);
      }, 500);

    } catch (err) {
      console.error("Submission Error:", err);
      alert("เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ โปรดลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-10 pb-20 px-4 max-w-xl mx-auto space-y-8 animate-smooth-in">
      <div className="bg-white dark:bg-slate-900 rounded-[60px] p-10 md:p-12 shadow-2xl border border-white dark:border-slate-800 space-y-10">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-slate-800 dark:text-white">กรอกข้อมูลเพื่อเติมเงิน</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{game.name} - {pkg.name}</p>
        </div>

        {game.topupTypes && game.topupTypes.length > 0 && (
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">เลือกรูปแบบการเติมเงิน</label>
            <div className="grid grid-cols-1 gap-2">
              {game.topupTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center justify-between px-8 py-4 rounded-full border-2 transition-all font-black text-sm ${selectedType === type ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-slate-100 dark:hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-3">
                    {type.toLowerCase().includes('id') ? <User size={16}/> : <Ticket size={16}/>}
                    {type}
                  </div>
                  {selectedType === type && <CheckCircle2 size={16} className="text-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((f, i) => (
            <div key={f.id} className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>
              <div className="relative">
                <input 
                  type={f.type} 
                  placeholder={f.placeholder}
                  value={formData[f.id] || ''}
                  onChange={e => handleInputChange(f.id, e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[35px] font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all disabled:opacity-50"
                />
                {i === 0 && game.isVerifyEnabled && selectedType.toLowerCase().includes('id') && (
                  <button 
                    onClick={handleVerify}
                    disabled={isVerifying || isSubmitting || !formData[f.id]}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-6 py-2 rounded-full text-[10px] font-black hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isVerifying ? <Loader2 size={12} className="animate-spin"/> : <Search size={12}/>}
                    เช็คชื่อไอดี
                  </button>
                )}
              </div>
            </div>
          ))}

          {ign && (
            <div className="bg-green-50 p-6 rounded-[35px] border border-green-100 flex items-center gap-4 animate-scale-in">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 size={24}/>
              </div>
              <div>
                <div className="text-[9px] font-black text-green-500 uppercase tracking-widest">ชื่อผู้เล่นที่พบ</div>
                <div className="text-xl font-black text-slate-800">{ign}</div>
              </div>
            </div>
          )}

          {verifyError && (
            <div className="bg-red-50 p-6 rounded-[35px] border border-red-100 flex items-center gap-4 text-red-500">
              <AlertCircle size={24}/>
              <span className="text-sm font-bold">{verifyError}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ระบุหมายเหตุ (ถ้ามี)</label>
            <textarea 
              rows={3} 
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[35px] font-bold text-slate-800 dark:text-white focus:outline-none disabled:opacity-50" 
              placeholder="แจ้งข้อมูลเพิ่มเติมถึงแอดมินที่นี่..."
              value={formData.admin_note || ''}
              disabled={isSubmitting}
              onChange={e => handleInputChange('admin_note', e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-6 bg-slate-900 text-white rounded-pill font-black text-xl shadow-2xl hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-4 shimmer-btn disabled:opacity-70 disabled:translate-y-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={24} className="animate-spin" /> กำลังสร้างออเดอร์...
            </>
          ) : (
            <>
              ดำเนินการต่อ <ArrowRight size={24}/>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-slate-400">
        <ShieldCheck size={16}/>
        <span className="text-[10px] font-black uppercase tracking-widest">ระบบชำระเงินปลอดภัย 100%</span>
      </div>
    </div>
  );
};
