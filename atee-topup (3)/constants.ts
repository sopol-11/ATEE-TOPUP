
import { Game, Package, FormField, Coupon, PromoBanner, ApiConfig } from './types';

export const GAMES: Game[] = [
  { id: '1', name: 'ROBLOX', image: 'https://images.unsplash.com/photo-1627389955609-bc02120bc04d?w=400&h=400&fit=crop', category: 'PC', soldCount: 99, active: true, orderIndex: 1, isNewArrival: false, totalStock: 999, isFlashSale: false, isVerifyEnabled: false, topupTypes: ['Player ID'] },
  { id: '2', name: 'VALORANT', image: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=400&fit=crop', category: 'PC', isFlashSale: true, flashSalePrice: 150, soldCount: 150, totalStock: 200, active: true, orderIndex: 2, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Player ID'] },
  { id: '3', name: 'FREE FIRE', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop', category: 'Mobile', soldCount: 200, active: true, orderIndex: 3, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Player ID'] },
  { id: '4', name: 'NETFLIX PREMIUM', image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=400&fit=crop', category: 'PremiumApp', isNewArrival: true, soldCount: 450, active: true, orderIndex: 4, totalStock: 999, isFlashSale: false, isVerifyEnabled: false, topupTypes: ['Email Account'] },
  { id: '5', name: 'YOUTUBE PREMIUM', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop', category: 'PremiumApp', isFlashSale: true, flashSalePrice: 39, soldCount: 88, totalStock: 100, active: true, orderIndex: 5, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Email Account'] },
  { id: '6', name: 'AIS TOPUP', image: 'https://cdn.pixabay.com/photo-2021/11/03/17/28/sim-card-6766345_1280.jpg', category: 'MobileTopup', soldCount: 120, active: true, orderIndex: 6, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Phone Number'] },
  { id: '6b', name: 'TRUE MOVE H', image: 'https://cdn.pixabay.com/photo-2016/11/19/23/00/mobile-phone-1841571_1280.jpg', category: 'MobileTopup', soldCount: 210, active: true, orderIndex: 11, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Phone Number'] },
  { id: '6c', name: 'DTAC', image: 'https://cdn.pixabay.com/photo-2017/04/19/13/03/smartphone-2242133_1280.jpg', category: 'MobileTopup', soldCount: 145, active: true, orderIndex: 12, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Phone Number'] },
  { id: '7', name: 'STEAM WALLET', image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=400&fit=crop', category: 'GiftCard', isNewArrival: true, soldCount: 50, active: true, orderIndex: 7, totalStock: 999, isFlashSale: false, isVerifyEnabled: false, topupTypes: ['Gift Card Code'] },
  { id: '8', name: 'RAZER GOLD', image: 'https://images.unsplash.com/photo-1593642532400-2682810df593?w=400&h=400&fit=crop', category: 'GiftCard', soldCount: 310, active: true, orderIndex: 8, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Gift Card Code'] },
  { id: '9', name: 'GOOGLE PLAY', image: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=400&h=400&fit=crop', category: 'GiftCard', soldCount: 190, active: true, orderIndex: 9, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Gift Card Code'] },
  { id: '10', name: 'ITUNES GIFT CARD', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop', category: 'GiftCard', soldCount: 85, active: true, orderIndex: 10, totalStock: 999, isFlashSale: false, isNewArrival: false, isVerifyEnabled: false, topupTypes: ['Gift Card Code'] },
];

export const PACKAGES: Package[] = [
  { id: 'p1', gameId: '1', name: '400 Robux', price: 150, allowInstallment: false, active: true },
  { id: 'p2', gameId: '4', name: 'Netflix 30 วัน', price: 120, allowInstallment: false, active: true },
  { id: 'p3', gameId: '5', name: 'Youtube 30 วัน', price: 59, allowInstallment: false, active: true },
  { id: 'p4', gameId: '6', name: 'เติมเงิน 100 บาท', price: 100, allowInstallment: false, active: true },
  { id: 'p4b', gameId: '6', name: 'เติมเงิน 200 บาท', price: 200, allowInstallment: false, active: true },
  { id: 'p4c', gameId: '6b', name: 'True 50 บาท', price: 50, allowInstallment: false, active: true },
  { id: 'p4d', gameId: '6b', name: 'True 100 บาท', price: 100, allowInstallment: false, active: true },
  { id: 'p4e', gameId: '6c', name: 'DTAC 100 บาท', price: 100, allowInstallment: false, active: true },
  { id: 'p5', gameId: '7', name: 'Steam 200 THB', price: 200, allowInstallment: false, active: true },
  { id: 'p6', gameId: '7', name: 'Steam 500 THB', price: 500, allowInstallment: false, active: true },
  { id: 'p7', gameId: '7', name: 'Steam 1000 THB', price: 1000, allowInstallment: true, minInstallmentAmount: 500, active: true },
  { id: 'p8', gameId: '8', name: 'Razer 100 Gold', price: 100, allowInstallment: false, active: true },
  { id: 'p9', gameId: '8', name: 'Razer 300 Gold', price: 300, allowInstallment: false, active: true },
];

export const PROMOS: PromoBanner[] = [
  { id: 'promo1', image: 'https://images.unsplash.com/photo-1627389955609-bc02120bc04d?w=1400&h=600&fit=crop', link: '', active: true, priority: 1 },
  { id: 'promo2', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1400&h=600&fit=crop', link: '', active: true, priority: 2 }
];

export const COUPONS: Coupon[] = [
  { 
    id: 'welcome', 
    code: 'WELCOME', 
    discountType: 'PERCENT', 
    discountValue: 10, 
    expiryDate: Date.now() + 31536000000, 
    usageLimit: 1000, 
    usedCount: 0, 
    active: true, 
    minAmount: 100, 
    maxDiscount: 50 
  }
];

export const API_CONFIGS: ApiConfig[] = [
  {
    id: 'api_roblox',
    name: 'Roblox Verify',
    endpoint: 'https://users.roblox.com/v1/users/{id}',
    method: 'GET',
    responsePath: 'name'
  }
];

export const GAME_FORMS: Record<string, FormField[]> = {
  'default': [
    { id: 'account_id', label: 'ไอดีผู้ใช้ / เบอร์โทร', type: 'text', required: true, placeholder: 'กรอกข้อมูลที่นี่' },
  ]
};
