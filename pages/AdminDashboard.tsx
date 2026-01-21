
import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, History, Users, Gamepad2, 
  Package as PackageIcon, Image as ImageIcon, Settings as SettingsIcon, 
  LayoutGrid as LayoutIcon, BarChart3, Star, Ticket, MessageSquare,
  ShieldCheck, ShieldAlert, Zap, DollarSign, Clock, Plus, Filter, Globe, Smartphone
} from 'lucide-react';
import { DB } from '../db';
import { Order, Game, User, SystemSettings, Package, Review, PromoBanner, GameForm, Installment, ApiConfig, Coupon } from '../types';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminGames } from '../components/admin/AdminGames';
import { AdminStats } from '../components/admin/AdminStats';
import { AdminPackages } from '../components/admin/AdminPackages';
import { AdminForms } from '../components/admin/AdminForms';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminPromos } from '../components/admin/AdminPromos';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminInstallments } from '../components/admin/AdminInstallments';
import { AdminApiConfig } from '../components/admin/AdminApiConfig';
import { AdminReviews } from '../components/admin/AdminReviews';
import { AdminCoupons } from '../components/admin/AdminCoupons';
import { AdminFlashSale } from '../components/admin/AdminFlashSale';
import { AdminMobileTopup } from '../components/admin/AdminMobileTopup';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [orders, setOrders] = useState<Order[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DB.getSettings());
  const [packages, setPackages] = useState<Package[]>([]);
  const [forms, setForms] = useState<GameForm[]>([]);
  const [promos, setPromos] = useState<PromoBanner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsubOrders = DB.subscribe('orders', (data) => setOrders(data.sort((a,b) => b.createdAt - a.createdAt)));
    const unsubGames = DB.subscribe('games', (data) => setGames(data.sort((a,b) => a.orderIndex - b.orderIndex)));
    const unsubUsers = DB.subscribe('users', (data) => setUsers(data));
    const unsubPackages = DB.subscribe('packages', (data) => setPackages(data));
    const unsubForms = DB.subscribe('forms', (data) => setForms(data));
    const unsubPromos = DB.subscribe('promos', (data) => setPromos(data));
    const unsubCoupons = DB.subscribe('coupons', (data) => setCoupons(data));
    const unsubInstallments = DB.subscribe('installments', (data) => setInstallments(data));
    const unsubApiConfigs = DB.subscribe('api_configs', (data) => setApiConfigs(data));
    const unsubReviews = DB.subscribe('reviews', (data) => setReviews(data.sort((a,b) => b.createdAt - a.createdAt)));
    const unsubSettings = DB.subscribe('settings', (data) => {
      const global = data.find(d => d.id === 'global');
      if (global) setSettings(global as SystemSettings);
    });

    return () => {
      unsubOrders(); unsubGames(); unsubUsers(); unsubPackages(); 
      unsubForms(); unsubPromos(); unsubCoupons(); unsubInstallments(); unsubSettings();
      unsubApiConfigs(); unsubReviews();
    };
  }, []);

  const menu = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: BarChart3 },
    { id: 'FLASH_SALE', label: 'Flash Sale', icon: Zap },
    { id: 'MOBILE_TOPUP', label: 'Mobile Topup', icon: Smartphone },
    { id: 'ORDERS', label: 'Orders', icon: ClipboardList },
    { id: 'INSTALLMENTS', label: 'Installments', icon: History },
    { id: 'COUPONS', label: 'Coupons', icon: Ticket },
    { id: 'REVIEWS', label: 'Reviews', icon: Star },
    { id: 'GAMES', label: 'Games', icon: Gamepad2 },
    { id: 'PACKAGES', label: 'Packages', icon: PackageIcon },
    { id: 'FORMS', label: 'Forms', icon: LayoutIcon },
    { id: 'API_CONFIG', label: 'Verification API', icon: Globe },
    { id: 'USERS', label: 'Users', icon: Users },
    { id: 'PROMOS', label: 'Promos', icon: ImageIcon },
    { id: 'SETTINGS', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 pt-10 pb-20 flex flex-col lg:flex-row gap-6 md:gap-10">
      <div className="lg:w-72 shrink-0">
        <div className="bg-white rounded-[35px] md:rounded-[50px] p-3 md:p-8 shadow-sm border border-white lg:sticky lg:top-32">
          <div className="px-4 py-4 mb-4 border-b border-slate-50 hidden lg:block">
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter">ATEE PANEL</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Online</span>
            </div>
          </div>
          
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto no-scrollbar scroll-container pb-2 lg:pb-0">
            {menu.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-full font-bold text-[11px] md:text-sm transition-all group ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'DASHBOARD' && <AdminStats orders={orders} users={users} />}
          {activeTab === 'FLASH_SALE' && <AdminFlashSale games={games} />}
          {activeTab === 'MOBILE_TOPUP' && <AdminMobileTopup games={games} packages={packages} />}
          {activeTab === 'ORDERS' && <AdminOrders orders={orders} games={games} />}
          {activeTab === 'INSTALLMENTS' && <AdminInstallments installments={installments} orders={orders} games={games} />}
          {activeTab === 'COUPONS' && <AdminCoupons coupons={coupons} games={games} />}
          {activeTab === 'REVIEWS' && <AdminReviews reviews={reviews} />}
          {activeTab === 'GAMES' && <AdminGames games={games} apiConfigs={apiConfigs} />}
          {activeTab === 'PACKAGES' && <AdminPackages packages={packages} games={games} />}
          {activeTab === 'FORMS' && <AdminForms forms={forms} games={games} />}
          {activeTab === 'API_CONFIG' && <AdminApiConfig apiConfigs={apiConfigs} />}
          {activeTab === 'USERS' && <AdminUsers users={users} />}
          {activeTab === 'PROMOS' && <AdminPromos promos={promos} />}
          {activeTab === 'SETTINGS' && <AdminSettings settings={settings} />}
        </div>
      </div>
    </div>
  );
};