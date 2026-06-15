export interface Product {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  price: number;
  rating?: number;
  image: string;
  isStaffPick?: boolean;
  isSphnPick?: boolean;
  inStock?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  customization?: any;
}

export interface PickupSlip {
  orderId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  contactNumber: string;
  pickupTimeSlot: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'READY' | 'ACCEPTED' | 'HOLD' | 'CANCELLED' | 'PICKED_UP';
  createdAt: string;
  createdDate?: string;
  upiUtr?: string;
  upiScreenshot?: string;
  upiApp?: string;
  userId?: string;
}

