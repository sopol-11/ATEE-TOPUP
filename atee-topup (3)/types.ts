
export type GameCategory = 'Mobile' | 'PC' | 'Console' | 'GiftCard' | 'PremiumApp' | 'MobileTopup';

export interface Game {
  id: string;
  name: string;
  image: string;
  category: GameCategory;
  active: boolean;
  orderIndex: number;
  soldCount: number;
  totalStock: number;
  isFlashSale: boolean;
  flashSalePrice?: number; // Legacy support (optional)
  flashSaleEnd?: number;
  isNewArrival: boolean;
  apiConfigId?: string; 
  isVerifyEnabled: boolean;
  topupTypes: string[]; 
}

export interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST';
  headers?: string;
  responsePath: string;
}

export interface Package {
  id: string;
  gameId: string;
  name: string;
  price: number;
  allowInstallment: boolean;
  minInstallmentAmount?: number;
  installmentMonths?: number;
  active: boolean;
  // Flash Sale Fields
  isFlashSale?: boolean;
  flashSalePrice?: number;
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'password' | 'email' | 'select';
  required: boolean;
  placeholder: string;
  options?: string[];
}

export interface GameForm {
  gameId: string;
  typeId?: string; 
  fields: FormField[];
}

export type OrderStatus = 'PENDING' | 'WAITING_REVIEW' | 'PROCESSING' | 'SUCCESS' | 'CANCELLED' | 'PAID';

export interface Order {
  id: string;
  userId?: string;
  gameId: string;
  packageId: string;
  topupType?: string; 
  amount: number;
  discountAmount?: number;
  couponId?: string;
  status: OrderStatus;
  gameData: Record<string, string>;
  isInstallment: boolean;
  adminNote?: string;
  paymentSlip?: string;
  isAutoVerified?: boolean;
  verificationData?: any;
  paymentMethod?: 'PROMPTPAY' | 'TRUEMONEY';
  createdAt: number;
  ign?: string;
  items?: {
    gameId: string;
    packageId: string;
    name: string;
    price: number;
  }[];
}

export interface Installment {
  id: string;
  orderId: string;
  userId: string;
  totalAmount: number;
  paidAmount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  history: {
    amount: number;
    date: number;
    slip?: string;
  }[];
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  uid?: string;
  isBlocked?: boolean;
  displayName?: string;
  phoneNumber?: string;
  lineId?: string;
}

export interface PromoBanner {
  id: string;
  image: string;
  link: string;
  active: boolean;
  priority: number;
}

export interface ContactChannel {
  id: string;
  name: string;
  value: string;
  icon?: string;
  url?: string;
}

export interface SystemSettings {
  promptPayId: string;
  promptPayName: string;
  truemoneyPhone: string;
  truemoneyName: string;
  isInstallmentEnabled: boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage?: string;
  forceLogin: boolean;
  contactLine: string;
  terms: string;
  flashSaleEnabled: boolean;
  slipVerifyApiKey?: string;
  isSlipVerifyEnabled: boolean;
  announcement?: string; 
  contactChannels?: ContactChannel[]; 
}

export interface CartItem {
  id: string;
  gameId: string;
  packageId: string;
  price: number;
  name: string;
  gameName: string;
  image: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate: number;
  usageLimit: number;
  usedCount: number;
  specificGameId?: string;
  active: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  gameId: string;
  gameName: string;
  rating: number;
  comment: string;
  createdAt: number;
}
