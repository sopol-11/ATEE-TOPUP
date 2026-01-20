
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Mail, Lock, Loader2, ArrowRight, Gamepad2, Apple } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, OAuthProvider, signInWithPopup } from 'firebase/auth';

export const LoginPage = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!auth) {
      setError('ระบบล้มเหลวในการเชื่อมต่อ Firebase');
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(from);
    } catch (err: any) {
      console.error("Login error code:", err.code);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('อีเมลหรือรหัสผ่านไม่ถูกต้อง โปรดตรวจสอบข้อมูลอีกครั้ง');
      } else if (err.code === 'auth/too-many-requests') {
        setError('บัญชีถูกระงับชั่วคราวเนื่องจากลองผิดหลายครั้ง โปรดลองใหม่ภายหลัง');
      } else {
        setError('เกิดข้อผิดพลาด: ' + (err.message || 'ไม่สามารถเข้าสู่ระบบได้'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsSocialLoading(true);
    try {
      await loginWithGoogle();
      navigate(from);
    } catch (err: any) {
      setError('ไม่สามารถลงชื่อเข้าใช้ด้วย Google ได้');
    } finally {
      setIsSocialLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setIsSocialLoading(true);
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth!, provider);
      navigate(from);
    } catch (err: any) {
      console.error(err);
      setError('ไม่สามารถลงชื่อเข้าใช้ด้วย Apple ID ได้');
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full min-h-[600px] border border-white">
        
        {/* Left Side - Image/Brand */}
        <div className="w-full md:w-1/2 bg-slate-900 relative overflow-hidden group flex flex-col justify-between p-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-900/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000" 
            alt="Gaming Background" 
          />
          
          <div className="relative z-20">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
              <Gamepad2 className="text-white" size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-4">
              WELCOME<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">BACK!</span>
            </h1>
            <p className="text-slate-300 font-medium text-sm max-w-xs leading-relaxed">
              เข้าสู่ระบบเพื่อจัดการคำสั่งซื้อ เติมเกม และติดตามสถานะสินค้าได้ทันที ตลอด 24 ชม.
            </p>
          </div>

          <div className="relative z-20 mt-8">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-[20px] border border-white/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">New Member?</p>
               <button onClick={() => navigate('/register')} className="flex items-center gap-2 text-sm font-bold hover:text-blue-300 transition-colors">
                 สมัครสมาชิกใหม่ <ArrowRight size={16} />
               </button>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 bg-white flex flex-col justify-center relative">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">ลงชื่อเข้าใช้</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Enter your credentials to access</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 px-6 py-4 rounded-3xl text-xs font-bold flex items-center gap-3 animate-shake border border-red-100">
                <AlertCircle size={18} className="shrink-0" /> {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleGoogleLogin}
                disabled={isSocialLoading || isLoading}
                className="py-4 bg-white border-2 border-slate-100 rounded-full font-bold text-slate-600 flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                <span className="text-xs">Google</span>
              </button>
              <button 
                onClick={handleAppleLogin}
                disabled={isSocialLoading || isLoading}
                className="py-4 bg-black text-white rounded-full font-bold flex items-center justify-center gap-3 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
              >
                <Apple size={20} className="mb-0.5" />
                <span className="text-xs">Apple ID</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink-0 mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Or Email</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">อีเมล (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@example.com" 
                    className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 border border-slate-100 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all text-slate-900 placeholder:text-slate-300" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-widest">รหัสผ่าน (Password)</label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-14 pr-6 py-4 rounded-full bg-slate-50 border border-slate-100 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-blue-100/50 transition-all text-slate-900 placeholder:text-slate-300" 
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading || isSocialLoading}
                className="w-full py-5 bg-slate-900 text-white rounded-full font-black text-lg shadow-xl shadow-slate-200 hover:bg-black hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
              >
                {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>เข้าสู่ระบบ <ArrowRight size={20}/></>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
