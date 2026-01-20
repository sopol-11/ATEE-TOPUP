
import { Order, OrderStatus, Installment, User, Game, Package, GameForm, PromoBanner, SystemSettings, Coupon, Review, ApiConfig } from './types';
import { GAMES, PACKAGES, PROMOS, COUPONS, API_CONFIGS } from './constants';
import { db } from './firebaseConfig';
import { 
  collection, addDoc, setDoc, doc, updateDoc, getDocs, 
  query, where, deleteDoc, onSnapshot, orderBy, limit
} from 'firebase/firestore';

// Helper to get fallback data
const getDataFromConstants = (collectionName: string): any[] => {
  switch(collectionName) {
      case 'games': return GAMES;
      case 'packages': return PACKAGES;
      case 'promos': return PROMOS;
      case 'coupons': return COUPONS;
      case 'api_configs': return API_CONFIGS;
      case 'settings': 
           return [{ 
             id: 'global', 
             promptPayId: "0863058154",
             promptPayName: "บจก. เอที ท็อปอัพ",
             truemoneyPhone: "0863058154",
             truemoneyName: "ATEE TOPUP",
             isInstallmentEnabled: true,
             isMaintenanceMode: false,
             forceLogin: true,
             contactLine: "@ATEETOPUP",
             terms: "1. ตรวจสอบไอดีให้ถูกต้อง\n2. เติมแล้วไม่สามารถยกเลิกได้",
             flashSaleEnabled: true,
             isSlipVerifyEnabled: false,
             announcement: "ยินดีต้อนรับสู่ ATEE TOPUP เติมเกมราคาถูก ตลอด 24 ชม."
           }];
      case 'reviews': return [];
      default: return [];
  }
};

export const DB = {
  // ฟังก์ชันสำหรับ Initialize Data ลง Firestore ครั้งแรก
  seedDatabase: async () => {
    if (!db) return;
    
    try {
      // 1. Check & Seed Games
      const gamesSnap = await getDocs(collection(db, 'games'));
      if (gamesSnap.empty) {
        console.log('Seeding Games...');
        const batchPromises = GAMES.map(g => setDoc(doc(db, 'games', g.id), g));
        await Promise.all(batchPromises);
      }
      // ... (Other seeding logic can remain, but catch block handles failures)
    } catch (e) {
      console.warn("Offline mode or DB init failed, using local data:", e);
    }
  },

  subscribe: (collectionName: string, callback: (data: any[]) => void) => {
    // 1. STRATEGY: Cache-First / Offline-First
    // Serve data immediately from LocalStorage or Constants so the UI never looks empty
    const cached = localStorage.getItem(`atee_${collectionName}`);
    if (cached) {
      try {
        callback(JSON.parse(cached));
      } catch (e) {
        callback(getDataFromConstants(collectionName));
      }
    } else {
      callback(getDataFromConstants(collectionName));
    }

    if (!db) return () => {};

    // 2. Then try to connect to Firestore for live updates
    try {
      const q = query(collection(db, collectionName));
      return onSnapshot(q, (snapshot) => {
        const data: any[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id });
        });
        // Update cache
        localStorage.setItem(`atee_${collectionName}`, JSON.stringify(data));
        // Update UI with fresh data
        callback(data);
      }, (error) => {
        console.warn(`Subscription warning for ${collectionName} (using offline data):`, error);
      });
    } catch (e) {
      console.error(`Error setting up subscription for ${collectionName}`, e);
      return () => {};
    }
  },

  verifyPlayerId: async (gameId: string, playerId: string): Promise<string | null> => {
    // Fetch configs directly or from cache
    let apiConfigs = JSON.parse(localStorage.getItem('atee_api_configs') || '[]');
    if (apiConfigs.length === 0) apiConfigs = API_CONFIGS;

    const games = DB.getGames();
    const game = games.find((g: any) => g.id === gameId);
    
    if (!game || !game.isVerifyEnabled || !game.apiConfigId) return null;
    const config = apiConfigs.find((c: any) => c.id === game.apiConfigId);
    if (!config) return null;

    try {
      const url = config.endpoint.replace('{id}', encodeURIComponent(playerId));
      const response = await fetch(url, {
        method: config.method,
        headers: JSON.parse(config.headers || '{}')
      });
      if (!response.ok) return null;
      
      const data = await response.json();
      const path = config.responsePath.split('.');
      let result = data;
      for (const key of path) {
        result = result?.[key];
      }
      return result ? String(result) : null;
    } catch (e) {
      console.error("Verification API Error:", e);
      return null;
    }
  },

  fetchUserOrders: async (userId: string) => {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      const data: Order[] = [];
      snap.forEach(doc => data.push({ ...doc.data(), id: doc.id } as Order));
      data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      const limitedData = data.slice(0, 50);
      localStorage.setItem('atee_orders', JSON.stringify(limitedData));
      return limitedData;
    } catch (err) {
      console.error("Error fetching orders:", err);
      return JSON.parse(localStorage.getItem('atee_orders') || '[]');
    }
  },

  getOrders: (): Order[] => {
    const stored = localStorage.getItem('atee_orders');
    return stored ? JSON.parse(stored) : [];
  },

  saveOrder: async (order: Order) => {
    // Always save to local first for immediate feedback
    const current = DB.getOrders();
    const updated = [order, ...current.filter(o => o.id !== order.id)];
    localStorage.setItem('atee_orders', JSON.stringify(updated));

    if (db) {
      try {
        await setDoc(doc(db, 'orders', order.id), order);
      } catch (e) {
        console.error("Save Order Error (Offline mode):", e);
      }
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus, adminNote?: string, verificationData?: any) => {
    // Optimistic update
    const current = DB.getOrders();
    const target = current.find(o => o.id === id);
    if (target) {
      target.status = status;
      if (adminNote) target.adminNote = adminNote;
      if (verificationData) target.verificationData = verificationData;
      localStorage.setItem('atee_orders', JSON.stringify(current));
    }

    if (db) {
      try {
        const updateObj: any = { status };
        if (adminNote) updateObj.adminNote = adminNote;
        if (verificationData) updateObj.verificationData = verificationData;
        await updateDoc(doc(db, 'orders', id), updateObj);
      } catch(e) {
        console.error("Update Order Error (Offline):", e);
      }
    }
  },

  getGames: (): Game[] => {
    const stored = localStorage.getItem('atee_games');
    return stored ? JSON.parse(stored) : GAMES;
  },

  getPackages: (): Package[] => {
    const stored = localStorage.getItem('atee_packages');
    return stored ? JSON.parse(stored) : PACKAGES;
  },

  getSettings: (): SystemSettings => {
    const stored = localStorage.getItem('atee_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.find((s: any) => s.id === 'global') || parsed[0];
      return parsed;
    }
    return getDataFromConstants('settings')[0];
  },

  fetchCollection: async <T>(name: string): Promise<T[]> => {
    // Return constants immediately if db issue
    if (!db) return getDataFromConstants(name) as T[];
    try {
      const q = query(collection(db, name));
      const snap = await getDocs(q);
      const data: T[] = [];
      snap.forEach(doc => data.push({ ...doc.data(), id: doc.id } as T));
      if (data.length > 0) {
        localStorage.setItem(`atee_${name}`, JSON.stringify(data));
      }
      return data;
    } catch (err) {
      // Fallback
      console.warn(`Fetch ${name} failed, using fallback.`);
      const cached = localStorage.getItem(`atee_${name}`);
      if (cached) return JSON.parse(cached);
      return getDataFromConstants(name) as T[];
    }
  },
  
  saveReview: async (review: Review) => {
    if (db) await setDoc(doc(db, 'reviews', review.id), review);
    // Local update
    const reviews = DB.getReviews();
    localStorage.setItem('atee_reviews', JSON.stringify([review, ...reviews]));
  },

  getReviews: (): Review[] => {
    const stored = localStorage.getItem('atee_reviews');
    return stored ? JSON.parse(stored) : [];
  },
  getPromos: (): PromoBanner[] => {
     const stored = localStorage.getItem('atee_promos');
     return stored ? JSON.parse(stored) : PROMOS;
  },
  getForms: (): GameForm[] => {
    const stored = localStorage.getItem('atee_forms');
    return stored ? JSON.parse(stored) : [];
  },
  getCoupons: (): Coupon[] => {
    const stored = localStorage.getItem('atee_coupons');
    return stored ? JSON.parse(stored) : COUPONS;
  },
  getInstallments: (): Installment[] => {
    const stored = localStorage.getItem('atee_installments');
    return stored ? JSON.parse(stored) : [];
  },
  
  saveUser: async (user: User) => {
    if (db) await setDoc(doc(db, 'users', user.id), user);
  },

  verifySlip: async (image: string, amount: number, settings: SystemSettings) => {
    await new Promise(r => setTimeout(r, 2000)); 
    const isSuccess = Math.random() > 0.1; 
    return {
      success: isSuccess,
      data: isSuccess ? { transRef: "TXN" + Date.now(), amount: amount, senderName: "Customer" } : null
    };
  },

  saveGame: async (game: Game) => {
    if (db) await setDoc(doc(db, 'games', game.id), game);
  },

  savePackage: async (pkg: Package) => {
    if (db) await setDoc(doc(db, 'packages', pkg.id), pkg);
  },

  saveForm: async (form: GameForm) => {
    if (db) await setDoc(doc(db, 'forms', form.gameId), form);
  },

  updateUser: async (user: User) => {
    if (db) await setDoc(doc(db, 'users', user.id), user);
  },

  savePromo: async (promo: PromoBanner) => {
    if (db) await setDoc(doc(db, 'promos', promo.id), promo);
  },

  deletePromo: async (id: string) => {
    if (db) await deleteDoc(doc(db, 'promos', id));
  },

  saveCoupon: async (coupon: Coupon) => {
    if (db) await setDoc(doc(db, 'coupons', coupon.id), coupon);
  },

  deleteCoupon: async (id: string) => {
    if (db) await deleteDoc(doc(db, 'coupons', id));
  },

  saveSettings: async (settings: SystemSettings) => {
    if (db) await setDoc(doc(db, 'settings', 'global'), settings);
    localStorage.setItem('atee_settings', JSON.stringify([settings]));
  },

  updateInstallment: async (id: string, data: Partial<Installment>) => {
    if (db) await updateDoc(doc(db, 'installments', id), data);
  },

  saveApiConfig: async (config: ApiConfig) => {
    if (db) await setDoc(doc(db, 'api_configs', config.id), config);
  },

  deleteReview: async (id: string) => {
    if (db) await deleteDoc(doc(db, 'reviews', id));
  }
};
