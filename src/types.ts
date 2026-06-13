export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  createdAt?: string;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  userId?: string;
  fullName: string;
  rollNo: string;
  branch: string;
  year: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  contactNo: string;
  email: string;
  isVerified?: boolean;
  collegeName?: string;
  profileLocked?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Breakfast' | 'Lunch' | 'Snacks' | 'Beverages' | 'Desserts' | 'Chinese' | string;
  imageUrl: string;
  isAvailable: boolean;
  estimatedPrepTime: number; // in minutes
  rating: number;
  tags?: string[];
  isTodaySpecial?: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  customInstructions?: string;
}

export type OrderStatus = 'Pending' | 'Approved' | 'Preparing' | 'Ready for Pickup' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Paid' | 'Failed';

export interface OrderCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  customInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderCartItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: 'razorpay' | 'cash_on_delivery' | 'upi';
  paymentId?: string;
  createdAt: string;
  estimatedReadyAt?: string;
  tokenNumber: string; // Dynamic small order number for canteen desk pick-up, e.g. "C-14"
  rollNo?: string;
  branch?: string;
  year?: string;
}

// 👨💼 Admin Payment Settings config Entity
export interface PaymentSettings {
  upiId: string;
  merchantName: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'email';
  createdAt: string;
  read: boolean;
}
