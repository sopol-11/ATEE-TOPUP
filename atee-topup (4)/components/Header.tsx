
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LayoutDashboard, Home, Star, List, Search, Sun, Moon, MessageCircle, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface HeaderProps {
  onOpenChat: () => void;
  onOpenContact: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenChat, onOpenContact }) => {
  const { user } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-full flex flex-col items-center pt-4 md:pt-8 px-2 md:px-4 space-y-3 md:space-y-4 sticky top-0 z-[100]">
      {/* Top Navbar Pill */}
      <div className="w-full max-w-5xl glass dark:bg-slate-900/80 dark:border-slate-700 rounded-full px-5 md:px-8 py-2.5 md:py-4 flex items-center justify-between shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] transition-all hover:shadow-xl backdrop-blur-xl">
        <div 
          className="text-base md:text-xl font-black text-slate-800 dark:text-white cursor-pointer uppercase tracking-tighter hover:scale-105 transition-transform"
          onClick={() => navigate('/')}
        >
          ATEE TOPUP
        </div>
        <div className="flex items-center gap-1 md:gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-300 transition-all"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} className="md:w-[22px] md:h-[22px]" /> : <Sun size={18} className="md:w-[22px] md:h-[22px]" />}
          </button>

          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-purple-500 transition-all"
              title="Admin Dashboard"
            >
              <LayoutDashboard size={18} className="md:w-[22px] md:h-[22px]" />
            </button>
          )}
          <button 
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-300 relative transition-all"
            title="Cart"
          >
            <ShoppingCart size={18} className="md:w-[22px] md:h-[22px]" />
            {items.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[8px] md:text-[9px] font-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
                {items.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => user ? navigate('/profile') : navigate('/login')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-300 transition-all"
            title="Profile"
          >
            <UserIcon size={18} className="md:w-[22px] md:h-[22px]" />
          </button>
        </div>
      </div>

      {/* Menu Pill - Sub Navigation */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-full p-1 flex items-center gap-1 shadow-sm overflow-x-auto no-scrollbar max-w-full md:max-w-max mx-auto">
        <button 
          onClick={() => navigate('/')}
          className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] font-black transition-all flex items-center gap-2 ${isActive('/') ? 'bg-white dark:bg-slate-800 shadow-md text-slate-800 dark:text-white' : 'text-slate-400 hover:bg-white/30'}`}
        >
          <Home size={14} /> HOME
        </button>
        <button 
          onClick={() => navigate('/reviews')}
          className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] font-black transition-all flex items-center gap-2 ${isActive('/reviews') ? 'bg-white dark:bg-slate-800 shadow-md text-slate-800 dark:text-white' : 'text-slate-400 hover:bg-white/30'}`}
        >
          <Star size={14} /> REVIEWS
        </button>
        <button 
          onClick={() => navigate('/my-orders')}
          className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] font-black transition-all flex items-center gap-2 ${isActive('/my-orders') ? 'bg-white dark:bg-slate-800 shadow-md text-slate-800 dark:text-white' : 'text-slate-400 hover:bg-white/30'}`}
        >
          <List size={14} /> ORDERS
        </button>
        <button 
          onClick={() => navigate('/track')}
          className={`px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] font-black transition-all flex items-center gap-2 ${isActive('/track') ? 'bg-white dark:bg-slate-800 shadow-md text-slate-800 dark:text-white' : 'text-slate-400 hover:bg-white/30'}`}
        >
          <Search size={14} /> TRACK
        </button>
        
        {/* New Buttons for Chat & Contact */}
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></div>
        
        <button 
          onClick={onOpenChat}
          className="px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] font-black transition-all flex items-center gap-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <MessageCircle size={14} /> AI CHAT
        </button>
        <button 
          onClick={onOpenContact}
          className="px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[11px] font-black transition-all flex items-center gap-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <Phone size={14} /> CONTACT
        </button>
      </div>
    </div>
  );
};
