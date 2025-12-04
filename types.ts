
export type ServiceCategory = 'ILUSTRACIÓN DIGITAL' | 'ANIMACIÓN 2D' | 'ANIMACIÓN 3D' | 'MOTION GRAPHICS' | 'CHARACTER DESIGN' | 'STORYBOARDS';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  unit: string; // 'por segundo', 'por proyecto', 'hora'
  deliveryTime: string;
  image: string;
  variations: string[]; // e.g., 'Básico', 'Complejo'
  active: boolean;
}

export interface User {
  id: string;
  email: string;
  password?: string; // In real app, never store plain text
  name: string;
  phone?: string;
  role: 'client' | 'admin';
  favorites: string[]; // Service IDs
  registeredAt: string;
}

export interface CartItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number; // e.g., seconds of animation or number of illustrations
  variations?: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  specifications: {
    style: string;
    software: string[];
    description: string;
    budgetRange: string;
    files: string[]; // File names (simulated)
  };
  notes?: string;
}

export interface CustomRequestData {
  style: string;
  description: string;
  paymentMethod: 'card' | 'paypal';
  cardDetails?: {
    number: string;
    expiry: string;
    cvc: string;
    holder: string;
  };
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'FRAME_BY_FRAME' | 'ILLUSTRATION';
  image: string;
  description: string;
  client?: string;
}
