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
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'client' | 'admin'; // Ahora se obtiene de la tabla profiles
  favorites: string[]; // Service IDs
  registeredAt: string;
}

// Interfaz para los ítems en el carrito (client-side)
export interface CartItem {
  serviceId: string;
  serviceName: string;
  price: number;
  quantity: number; // e.g., seconds of animation or number of illustrations
  variations?: string;
}

// Interfaz para los ítems de pedido almacenados en la DB (order_items)
export interface OrderItem {
  id?: string; // Opcional para cuando se crea
  order_id?: string; // Opcional para cuando se crea
  service_id: string;
  service_name: string;
  price: number;
  quantity: number;
  variations?: string;
}

// Interfaz para los pedidos almacenados en la DB (orders)
export interface Order {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  created_at: string;
  items: OrderItem[]; // Se cargará por separado o se unirá en el frontend
  total: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  specifications: {
    style: string;
    software: string[];
    description: string;
    budgetRange: string;
    files: string[]; // URLs de los archivos subidos
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