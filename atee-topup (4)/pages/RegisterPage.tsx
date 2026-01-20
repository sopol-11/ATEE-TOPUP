
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, Loader2, User, ArrowRight, Gamepad2, MessageCircle } from 'lucide-react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [lineId, setLineId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (!auth) {
      setError('ระบบฐานข้อมูลขัดข้อง โปรดลองใหม่ภายหลัง');
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create Firestore User with Display Name and Line ID
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: email,
        displayName: displayName,
        lineId: lineId,
        role: 'USER',
        uid: 'ATEE-' + user.uid.substring(0, 5).toUpperCase(),
        createdAt: Date.now()
      });

      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('อีเมลนี้ถูกใช้งานไปแล้ว');
      } else if (err.code === 'auth/invalid-email') {
        setError('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setError('เกิดข้อผิดพลาดในการสมัครสมาชิก: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse max-w-5xl w-full min-h-[600px] border border-white dark:border-slate-800">
        
        {/* Right Side - Image/Brand */}
        <div className="w-full md:w-1/2 bg-slate-900 relative overflow-hidden group flex flex-col justify-between p-12 text-white text-right">
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/30 to-blue-900/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" 
            alt="Gaming Background" 
          />
          
          <div className="relative z-20 flex flex-col items-end">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <Gamepad2 className="text-white" size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">
              CREATE<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-purple-400 to-blue-400">ACCOUNT</span>
            </h1>
            <p className="text-slate-300 font-medium text-sm max-w-xs leading-relaxed">
              สมัครสมาชิกวันนี้เพื่อรับสิทธิพิเศษ ส่วนลด และโปรโมชั่นมากมายสำหรับเกมเมอร์
            </p>
          </div>

          <div className="relative z-20 mt-8 flex justify-end">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-[20px] border border-white/10 text-right">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Already have account?</p>
               <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm font-bold hover:text-purple-300 transition-colors justify-end">
                 เข้าสู่ระบบทันที <ArrowRight size={16} />
               </button>
            </div>
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 bg-white dark:bg-slate-900 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">สมัครสมาชิกใหม่</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Create your free account</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-6 py-4 rounded-3xl text-xs font-bold flex items-center gap-3 animate-shake border border-red-100 dark:border-red-900/50">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">ชื่อที่ใช้แสดง (Display Name)</label>
                 <div className="relative group">
                   <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={18} />
                   <input 
                     type="text" 
                     required
                     value={displayName}
                     onChange={e => setDisplayName(e.target.value)}
                     placeholder="ชื่อเล่นของคุณ" 
                     className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 dark:focus:ring-purple-900/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-300" 
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">LINE ID (สำหรับการติดต่อ)</label>
                 <div className="relative group">
                   <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" size={18} />
                   <input 
                     type="text" 
                     value={lineId}
                     onChange={e => setLineId(e.target.value)}
                     placeholder="ID Line ของคุณ" 
                     className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-green-100/50 dark:focus:ring-green-900/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-300" 
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">อีเมล (Email)</label>
                 <div className="relative group">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={18} />
                   <input 
                     type="email" 
                     required
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="yourname@email.com" 
                     className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 dark:focus:ring-purple-900/50 transition-all text-slate-900 dark:text-white placeholder:text-slate-300" 
                   />
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">รหัสผ่าน</label>
                   <div className="relative group">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={18} />
                     <input 
                       type="password" 
                       required
                       value={password}
                       onChange={e => setPassword(e.target.value)}
                       placeholder="••••••" 
                       className="w-full pl-14 pr-4 py-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 dark:focus:ring-purple-900/50 transition-all text-slate-900 dark:text-white" 
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">ยืนยันรหัส</label>
                   <div className="relative group">
                     <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={18} />
                     <input 
                       type="password" 
                       required
                       value={confirmPassword}
                       onChange={e => setConfirmPassword(e.target.value)}
                       placeholder="••••••" 
                       className="w-full pl-14 pr-4 py-4 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-purple-100/50 dark:focus:ring-purple-900/50 transition-all text-slate-900 dark:text-white" 
                     />
                   </div>
                 </div>
               </div>
               
               <button 
                 type="submit"
                 disabled={isLoading}
                 className="w-full py-5 bg-purple-600 text-white rounded-full font-black text-lg shadow-xl shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6"
               >
                 {isLoading ? <Loader2 size={24} className="animate-spin" /> : 'สมัครสมาชิก'}
               </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
