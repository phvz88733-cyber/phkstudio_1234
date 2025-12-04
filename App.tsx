import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Service, User, Order, CartItem, ToastNotification, PortfolioItem, OrderItem } from './types';
import CookieConsent from './cookieConsent';
import { supabase } from './src/integrations/supabase/client';

// Importar los nuevos componentes
import Toast from './src/components/Toast';
import Navbar from './src/components/Navbar';
import Hero from './src/components/Hero';
import ServicesPage from './src/pages/ServicesPage';
import PortfolioPage from './src/pages/PortfolioPage';
import CheckoutPage from './src/pages/CheckoutPage';
import AdminDashboardPage from './src/pages/AdminDashboardPage';
import UserProfilePage from './src/pages/UserProfilePage';
import AuthModal from './src/components/AuthModal';
import CartDrawer from './src/components/CartDrawer';
import Footer from './src/components/Footer';
import FloatingAdminBtn from './src/components/FloatingAdminBtn';
import ChatWidget from './src/components/ChatWidget';

// --- MOCK DATA GENERATORS ---

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Ilustración Digital Full Color', category: 'ILUSTRACIÓN DIGITAL', description: 'Ilustración detallada de alta resolución ideal para portadas, posters o publicidad.', price: 250, unit: 'proyecto', deliveryTime: '5-7 días', active: true, variations: ['Retrato', 'Paisaje', 'Concept Art'], image: 'https://picsum.photos/seed/art1/800/600' },
  { id: '2', name: 'Animación Explainer 2D', category: 'ANIMACIÓN 2D', description: 'Video explicativo en motion graphics para empresas y startups.', price: 150, unit: 'minuto', deliveryTime: '10-15 días', active: true, variations: ['Vectorial', 'Cut-out'], image: 'https://picsum.photos/seed/anim2/800/600' },
  { id: '3', name: 'Modelado y Render 3D', category: 'ANIMACIÓN 3D', description: 'Creación de assets 3D de alta fidelidad con texturas PBR.', price: 400, unit: 'asset', deliveryTime: '7-10 días', active: true, variations: ['Low Poly', 'High Poly', 'Fotorealista'], image: 'https://picsum.photos/seed/3dmodel/800/600' },
  { id: '4', name: 'Diseño de Personajes', category: 'CHARACTER DESIGN', description: 'Hoja de personaje completa con vistas frontal, lateral y expresiones.', price: 300, unit: 'personaje', deliveryTime: '5 días', active: true, variations: ['Cartoon', 'Anime', 'Semi-realista'], image: 'https://picsum.photos/seed/char/800/600' },
  { id: '5', name: 'Logo Animation', category: 'MOTION GRAPHICS', description: 'Animación de logotipo para intros de video y redes sociales.', price: 120, unit: 'proyecto', deliveryTime: '3 días', active: true, variations: ['Glitch', 'Clean', 'Liquid'], image: 'https://picsum.photos/seed/motion/800/600' },
  { id: '6', name: 'Storyboard Profesional', category: 'STORYBOARDS', description: 'Visualización secuencial para cine, tv o publicidad.', price: 50, unit: 'frame', deliveryTime: '2-4 días', active: true, variations: ['Boceto', 'Clean Line', 'Tono'], image: 'https://picsum.photos/seed/story/800/600' },
];

// --- MAIN APPLICATION ---

export default function App() {
  // State
  const [view, setView] = useState<'HOME' | 'SERVICES' | 'PORTFOLIO' | 'CART' | 'PROFILE' | 'ADMIN' | 'CHECKOUT'>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  
  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Supabase Auth State Management
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // Fetch user profile from public.profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, role') // Fetch the role
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          notify('Error al cargar el perfil del usuario.', 'error');
          setCurrentUser(null);
        } else {
          setCurrentUser({
            id: session.user.id,
            email: session.user.email || '',
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            role: profile?.role === 'admin' ? 'admin' : 'client', // Assign role from DB
            favorites: [], // This would be loaded from DB if it existed
            registeredAt: session.user.created_at,
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // onAuthStateChange will handle setting currentUser
      } else {
        setLoadingAuth(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load initial services and cart from localStorage
  useEffect(() => {
    // Init Services
    const storedServices = localStorage.getItem('phk_services');
    if (storedServices) setServices(JSON.parse(storedServices));
    else {
      localStorage.setItem('phk_services', JSON.stringify(INITIAL_SERVICES));
      setServices(INITIAL_SERVICES);
    }
    
    // Load Cart
    const storedCart = localStorage.getItem('phk_cart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('phk_cart', JSON.stringify(cart));
  }, [cart]);

  // Actions
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleLogin = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      notify(`Error al iniciar sesión: ${error.message}`, 'error');
    } else {
      notify('Inicio de sesión exitoso', 'success');
      setIsLoginOpen(false);
    }
  };

  const handleRegister = async (first_name: string, last_name: string, email: string, pass: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          first_name,
          last_name,
        },
      },
    });

    if (error) {
      notify(`Error al registrarse: ${error.message}`, 'error');
    } else if (data.user) {
      notify('Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.', 'success');
      setIsLoginOpen(false);
    } else {
      notify('Registro iniciado. Por favor, verifica tu correo electrónico.', 'info');
      setIsLoginOpen(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      notify(`Error al cerrar sesión: ${error.message}`, 'error');
    } else {
      setCurrentUser(null);
      setView('HOME');
      notify('Sesión cerrada', 'info');
    }
  };

  const addToCart = (service: Service) => {
    setCart(prev => {
      const existing = prev.find(item => item.serviceId === service.id);
      if (existing) {
        return prev.map(item => item.serviceId === service.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { serviceId: service.id, serviceName: service.name, price: service.price, quantity: 1 }];
    });
    notify(`${service.name} agregado al carrito`, 'success');
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.serviceId !== id));
  };

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans selection:bg-primary selection:text-white">
      <Navbar 
        view={view} 
        setView={setView} 
        currentUser={currentUser} 
        loadingAuth={loadingAuth} 
        cart={cart} 
        setIsCartOpen={setIsCartOpen} 
        setIsLoginOpen={setIsLoginOpen} 
        logout={logout} 
      />
      
      <main>
        {view === 'HOME' && (
          <>
            <Hero setView={setView} />
            <div className="py-20 text-center bg-surface">
              <h2 className="text-3xl font-orbitron font-bold mb-12">PROCESO DE TRABAJO</h2>
              <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto px-4">
                {['Consulta', 'Bocetaje', 'Producción', 'Revisión', 'Entrega Final'].map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center text-xl font-bold mb-4 relative">
                      {i + 1}
                      {i < 4 && <div className="hidden md:block absolute left-full w-full h-0.5 bg-slate-700 -z-10 w-24 translate-x-4"></div>}
                    </div>
                    <h3 className="font-bold text-white">{step}</h3>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-darker py-20 px-4">
              <h2 className="text-center text-3xl font-orbitron font-bold mb-12">TESTIMONIOS</h2>
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-surface p-8 rounded-xl border border-slate-800 relative">
                    <div className="flex text-yellow-500 mb-4"><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/><Star fill="currentColor" size={16}/></div>
                    <p className="text-slate-400 italic mb-6">"Increíble calidad y atención al detalle. El equipo de PHKStudio superó mis expectativas con la animación 3D."</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-700 rounded-full"></div>
                      <div>
                        <p className="font-bold text-white">Cliente {i}</p>
                        <p className="text-xs text-slate-500">Director Creativo</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="py-20 bg-gradient-to-r from-primary to-blue-900 text-center relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-4xl font-orbitron font-bold text-white mb-6">¿LISTO PARA EMPEZAR?</h2>
                <button onClick={() => setView('SERVICES')} className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-slate-100 transition-colors shadow-xl">
                  VER PRECIOS Y SERVICIOS
                </button>
              </div>
            </div>
          </>
        )}
        
        {view === 'SERVICES' && (
          <ServicesPage 
            services={services} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            addToCart={addToCart} 
            currentUser={currentUser}
            notify={notify}
            setOrders={setOrders}
            setView={setView}
          />
        )}
        {view === 'PORTFOLIO' && <PortfolioPage setView={setView} />}
        {view === 'CHECKOUT' && (
          <CheckoutPage 
            currentUser={currentUser} 
            cart={cart} 
            notify={notify} 
            setOrders={setOrders} 
            setCart={setCart} 
            setIsLoginOpen={setIsLoginOpen} 
            setView={setView}
          />
        )}
        {view === 'PROFILE' && <UserProfilePage currentUser={currentUser} orders={orders} logout={logout} />}
        {view === 'ADMIN' && <AdminDashboardPage currentUser={currentUser} orders={orders} setOrders={setOrders} logout={logout} setView={setView} />}
      </main>

      <Footer />
      <AuthModal 
        isLoginOpen={isLoginOpen} 
        setIsLoginOpen={setIsLoginOpen} 
        handleLogin={handleLogin} 
        handleRegister={handleRegister} 
      />
      <CartDrawer 
        isCartOpen={isCartOpen} 
        setIsCartOpen={setIsCartOpen} 
        cart={cart} 
        setCart={setCart} 
        removeFromCart={removeFromCart} 
        setView={setView}
      />
      <FloatingAdminBtn 
        currentUser={currentUser} 
        setView={setView} 
        setIsLoginOpen={setIsLoginOpen} 
      />
      <ChatWidget notify={notify} />
      <Toast notifications={notifications} remove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      <CookieConsent />
    </div>
  );
}