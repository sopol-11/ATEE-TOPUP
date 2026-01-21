
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { DialogProvider } from './contexts/DialogContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { AIChat } from './components/AIChat';
import { ContactModal } from './components/ContactModal';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { HomePage } from './pages/HomePage';
import { PackagePage } from './pages/PackagePage';
import { SummaryPage } from './pages/SummaryPage';
import { FormPage } from './pages/FormPage';
import { PaymentPage } from './pages/PaymentPage';
import { SuccessPage } from './pages/SuccessPage';
import { TrackPage } from './pages/TrackPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { MyInstallmentsPage } from './pages/MyInstallmentsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartPage } from './pages/CartPage';
import { GiftCardPage } from './pages/GiftCardPage';
import { MobileTopupPage } from './pages/MobileTopupPage';
import { PremiumAppPage } from './pages/PremiumAppPage';
import { ReviewPage } from './pages/ReviewPage';
import { Notification, NotificationType } from './components/Notification';
import { DB } from './db';
import { Loader2, Sparkles } from 'lucide-react';

interface NotificationContextType {
  showToast: (msg: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within Provider');
  return context;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/" />;
  return <>{children}</>;
};

const LoadingScreen = () => (
  <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-slate-900 overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070')] bg-cover bg-center opacity-20 blur-sm"></div>
    <div className="relative flex flex-col items-center space-y-8 animate-fade-in">
      <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[30px] flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)] animate-bounce">
        <Sparkles size={40} className="text-white" />
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase drop-shadow-lg">ATEE TOPUP</h1>
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm tracking-[0.3em] uppercase">
          <Loader2 size={16} className="animate-spin" />
          System Initializing
        </div>
      </div>

      <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 w-full animate-shimmer"></div>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const [toast, setToast] = useState<{ msg: string; type: NotificationType } | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const { user } = useAuth();
  const location = useLocation();
  const settings = DB.getSettings();

  const showToast = (msg: string, type: NotificationType) => {
    setToast({ msg, type });
  };

  useEffect(() => {
    const initAppData = async () => {
      try {
        // 1. Ensure DB structure exists
        await DB.seedDatabase();

        // 2. Fetch all required collections
        await Promise.all([
          DB.fetchCollection('games'),
          DB.fetchCollection('packages'),
          DB.fetchCollection('promos'),
          DB.fetchCollection('coupons'),
          DB.fetchCollection('reviews'),
          DB.fetchCollection('forms'),
          DB.fetchCollection('settings'),
          DB.fetchCollection('api_configs'),
          DB.fetchCollection('installments')
        ]);
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setTimeout(() => setAppLoading(false), 1200);
      }
    };
    initAppData();
  }, []);

  if (appLoading) return <LoadingScreen />;

  if (settings.isMaintenanceMode && user?.role !== 'ADMIN' && location.pathname !== '/login' && !location.pathname.startsWith('/admin')) {
    return <MaintenanceScreen />;
  }

  return (
    <NotificationContext.Provider value={{ showToast }}>
      <div className="min-h-screen relative overflow-x-hidden pb-20 selection:bg-blue-100 dark:selection:bg-blue-900 animate-fade-in bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <Header onOpenChat={() => setIsChatOpen(true)} onOpenContact={() => setIsContactOpen(true)} />
        
        {toast && (
          <Notification 
            message={toast.msg} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}

        <main className="animate-fade-in">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:gameId" element={<PackagePage />} />
            <Route path="/summary/:pkgId" element={<SummaryPage />} />
            <Route path="/form/:pkgId" element={<FormPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/success/:orderId" element={<SuccessPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-orders" element={<MyOrdersPage />} />
            <Route path="/my-installments" element={<MyInstallmentsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/giftcard" element={<GiftCardPage />} />
            <Route path="/mobile-topup" element={<MobileTopupPage />} />
            <Route path="/premium-apps" element={<PremiumAppPage />} />
            <Route path="/reviews" element={<ReviewPage />} />
            <Route 
              path="/admin/*" 
              element={<AdminRoute><AdminDashboard /></AdminRoute>} 
            />
          </Routes>
        </main>
        
        <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

        <div className="fixed -z-10 top-[-20%] right-[-10%] w-[1200px] h-[1200px] bg-blue-100/30 dark:bg-blue-900/10 blur-[180px] rounded-full pointer-events-none"></div>
        <div className="fixed -z-10 bottom-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-purple-100/20 dark:bg-purple-900/10 blur-[150px] rounded-full pointer-events-none"></div>
      </div>
    </NotificationContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DialogProvider>
          <CartProvider>
            <Router>
              <AppContent />
            </Router>
          </CartProvider>
        </DialogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
