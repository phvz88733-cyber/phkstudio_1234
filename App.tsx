
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, Menu, X, User as UserIcon, LogIn, Search, Star, 
  Trash2, Plus, Minus, Upload, Shield, CheckCircle, AlertCircle, 
  Instagram, Youtube, Facebook, Linkedin, ArrowRight, Play, Heart,
  BarChart, Users, Package, Settings, LogOut, MessageCircle, CreditCard, Lock,
  Image as ImageIcon, ZoomIn, Layers
} from 'lucide-react';
import { Service, User, Order, CartItem, ToastNotification, ServiceCategory, CustomRequestData, PortfolioItem } from './types';
import CookieConsent from './cookieConsent';

// --- MOCK DATA GENERATORS ---

const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Ilustración Digital Full Color', category: 'ILUSTRACIÓN DIGITAL', description: 'Ilustración detallada de alta resolución ideal para portadas, posters o publicidad.', price: 250, unit: 'proyecto', deliveryTime: '5-7 días', active: true, variations: ['Retrato', 'Paisaje', 'Concept Art'], image: 'https://picsum.photos/seed/art1/800/600' },
  { id: '2', name: 'Animación Explainer 2D', category: 'ANIMACIÓN 2D', description: 'Video explicativo en motion graphics para empresas y startups.', price: 150, unit: 'minuto', deliveryTime: '10-15 días', active: true, variations: ['Vectorial', 'Cut-out'], image: 'https://picsum.photos/seed/anim2/800/600' },
  { id: '3', name: 'Modelado y Render 3D', category: 'ANIMACIÓN 3D', description: 'Creación de assets 3D de alta fidelidad con texturas PBR.', price: 400, unit: 'asset', deliveryTime: '7-10 días', active: true, variations: ['Low Poly', 'High Poly', 'Fotorealista'], image: 'https://picsum.photos/seed/3dmodel/800/600' },
  { id: '4', name: 'Diseño de Personajes', category: 'CHARACTER DESIGN', description: 'Hoja de personaje completa con vistas frontal, lateral y expresiones.', price: 300, unit: 'personaje', deliveryTime: '5 días', active: true, variations: ['Cartoon', 'Anime', 'Semi-realista'], image: 'https://picsum.photos/seed/char/800/600' },
  { id: '5', name: 'Logo Animation', category: 'MOTION GRAPHICS', description: 'Animación de logotipo para intros de video y redes sociales.', price: 120, unit: 'proyecto', deliveryTime: '3 días', active: true, variations: ['Glitch', 'Clean', 'Liquid'], image: 'https://picsum.photos/seed/motion/800/600' },
  { id: '6', name: 'Storyboard Profesional', category: 'STORYBOARDS', description: 'Visualización secuencial para cine, tv o publicidad.', price: 50, unit: 'frame', deliveryTime: '2-4 días', active: true, variations: ['Boceto', 'Clean Line', 'Tono'], image: 'https://picsum.photos/seed/story/800/600' },
];

const MOCK_PORTFOLIO: PortfolioItem[] = [
  // Frame by Frame (Simulated with static keyframes)
  { id: 'p1', title: 'The Running Wolf', category: 'FRAME_BY_FRAME', image: 'https://picsum.photos/seed/wolf/800/600', description: 'Ciclo de caminata animado a mano, 12 fps, estilo boceto tradicional.', client: 'Indie Game Studio' },
  { id: 'p2', title: 'Cyberpunk Chase', category: 'FRAME_BY_FRAME', image: 'https://picsum.photos/seed/cyber/800/600', description: 'Secuencia de acción de alta velocidad. Animación tradicional digital.', client: 'Music Video' },
  { id: 'p3', title: 'Liquid Morph', category: 'FRAME_BY_FRAME', image: 'https://picsum.photos/seed/liquid/800/600', description: 'Transformaciones fluidas abstractas frame a frame.', client: 'Personal Project' },
  { id: 'p4', title: 'Character Acting', category: 'FRAME_BY_FRAME', image: 'https://picsum.photos/seed/acting/800/600', description: 'Prueba de actuación de personaje y sincronización labial.', client: 'Short Film' },
  
  // Illustration
  { id: 'p5', title: 'Neon Cityscapes', category: 'ILLUSTRATION', image: 'https://picsum.photos/seed/neon/800/800', description: 'Arte conceptual ambiental para videojuego RPG.', client: 'Game Dev Co' },
  { id: 'p6', title: 'Fantasy Warrior', category: 'ILLUSTRATION', image: 'https://picsum.photos/seed/warrior/800/1000', description: 'Diseño de personaje completo con armadura detallada.', client: 'Book Cover' },
  { id: 'p7', title: 'Editorial Tech', category: 'ILLUSTRATION', image: 'https://picsum.photos/seed/tech/800/600', description: 'Ilustración isométrica para artículo de revista tecnológica.', client: 'Tech Weekly' },
  { id: 'p8', title: 'Album Cover Art', category: 'ILLUSTRATION', image: 'https://picsum.photos/seed/album/800/800', description: 'Arte surrealista para portada de álbum musical.', client: 'Band Release' },
];

const MOCK_ADMIN: User = {
  id: 'admin001',
  email: 'admin', // Simplified for prompt requirements
  password: 'phkstudio2025',
  name: 'Admin Staff',
  role: 'admin',
  favorites: [],
  registeredAt: new Date().toISOString()
};

// --- HELPER COMPONENTS ---

const Toast = ({ notifications, remove }: { notifications: ToastNotification[], remove: (id: string) => void }) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    {notifications.map(n => (
      <div key={n.id} className={`p-4 rounded shadow-lg flex items-center gap-3 min-w-[300px] animate-fade-in ${n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-primary'} text-white`}>
        {n.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        <span className="text-sm font-medium">{n.message}</span>
        <button onClick={() => remove(n.id)} className="ml-auto hover:text-slate-200"><X size={16} /></button>
      </div>
    ))}
  </div>
);

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

  // LocalStorage Sync
  useEffect(() => {
    // Init Services
    const storedServices = localStorage.getItem('phk_services');
    if (storedServices) setServices(JSON.parse(storedServices));
    else {
      localStorage.setItem('phk_services', JSON.stringify(INITIAL_SERVICES));
      setServices(INITIAL_SERVICES);
    }

    // Init Orders
    const storedOrders = localStorage.getItem('phk_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));

    // Check User Session
    const storedUser = localStorage.getItem('phk_user_session');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    
    // Load Cart
    const storedCart = localStorage.getItem('phk_cart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('phk_cart', JSON.stringify(cart));
  }, [cart]);

  // Actions
  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  const handleLogin = (email: string, pass: string) => {
    if (email === MOCK_ADMIN.email && pass === MOCK_ADMIN.password) {
      setCurrentUser(MOCK_ADMIN);
      localStorage.setItem('phk_user_session', JSON.stringify(MOCK_ADMIN));
      notify('Bienvenido Staff PHKStudio', 'success');
      setIsLoginOpen(false);
      return;
    }
    
    const usersStr = localStorage.getItem('phk_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const user = users.find(u => u.email === email && u.password === pass);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('phk_user_session', JSON.stringify(user));
      notify(`Bienvenido de nuevo, ${user.name}`, 'success');
      setIsLoginOpen(false);
    } else {
      notify('Credenciales inválidas', 'error');
    }
  };

  const handleRegister = (name: string, email: string, pass: string) => {
    const usersStr = localStorage.getItem('phk_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.find(u => u.email === email)) {
      notify('El email ya está registrado', 'error');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      password: pass, // Insecure for demo
      role: 'client',
      registeredAt: new Date().toISOString(),
      favorites: []
    };

    users.push(newUser);
    localStorage.setItem('phk_users', JSON.stringify(users));
    setCurrentUser(newUser);
    localStorage.setItem('phk_user_session', JSON.stringify(newUser));
    notify('Registro exitoso. ¡Bienvenido!', 'success');
    setIsLoginOpen(false);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('phk_user_session');
    setView('HOME');
    notify('Sesión cerrada', 'info');
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

  // --- SUB-COMPONENTS (Inline for single file requirement) ---

  const Navbar = () => (
    <nav className="sticky top-0 z-40 bg-dark/80 backdrop-blur-lg border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center cursor-pointer" onClick={() => setView('HOME')}>
            <div className="text-2xl font-orbitron font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-white">
              PHK<span className="text-secondary">Studio</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-8 font-medium text-sm">
              <button onClick={() => setView('HOME')} className={`hover:text-primary transition-colors uppercase tracking-widest ${view === 'HOME' ? 'text-primary' : 'text-slate-300'}`}>Inicio</button>
              <button onClick={() => setView('SERVICES')} className={`hover:text-primary transition-colors uppercase tracking-widest ${view === 'SERVICES' ? 'text-primary' : 'text-slate-300'}`}>Servicios</button>
              <button onClick={() => setView('PORTFOLIO')} className={`hover:text-primary transition-colors uppercase tracking-widest ${view === 'PORTFOLIO' ? 'text-primary' : 'text-slate-300'}`}>Portfolio</button>
              <button onClick={() => {
                const el = document.getElementById('contact-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} className="text-slate-300 hover:text-primary transition-colors uppercase tracking-widest">Contacto</button>
              
              {currentUser?.role === 'admin' && (
                <button onClick={() => setView('ADMIN')} className="text-secondary hover:text-red-400 uppercase tracking-widest">Dashboard</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-slate-300 hover:text-white relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cart.length}
                </span>
              )}
            </button>
            
            {currentUser ? (
              <div className="relative group">
                <button onClick={() => setView('PROFILE')} className="flex items-center gap-2 text-slate-300 hover:text-white">
                  <UserIcon size={24} />
                  <span className="hidden md:inline">{currentUser.name.split(' ')[0]}</span>
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="flex items-center gap-2 text-primary hover:text-blue-300">
                <LogIn size={20} />
                <span className="hidden md:inline font-bold">LOGIN</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );

  const Hero = () => {
    const [slide, setSlide] = useState(0);
    const slides = [
      { title: "ANIMACIÓN 3D PROFESIONAL", subtitle: "Dale vida a tus ideas con la última tecnología", bg: "from-slate-900 to-blue-900", img: "https://picsum.photos/seed/hero1/1920/1080" },
      { title: "ILUSTRACIÓN DE IMPACTO", subtitle: "Arte conceptual y diseño de personajes únicos", bg: "from-slate-900 to-red-900", img: "https://picsum.photos/seed/hero2/1920/1080" },
      { title: "NUEVOS SERVICIOS 2025", subtitle: "Motion Graphics para llevar tu marca al siguiente nivel", bg: "from-slate-900 to-purple-900", img: "https://picsum.photos/seed/hero3/1920/1080" }
    ];

    useEffect(() => {
      const interval = setInterval(() => setSlide(s => (s + 1) % slides.length), 5000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="relative h-[80vh] overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/50 z-10" />
            <img src={s.img} className="w-full h-full object-cover" alt="Banner" />
            <div className={`absolute inset-0 bg-gradient-to-r ${s.bg} opacity-60 mix-blend-multiply`} />
            <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
              <div className="max-w-4xl animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-orbitron font-black text-white mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(70,130,180,0.5)]">
                  {s.title}
                </h1>
                <p className="text-xl md:text-2xl text-slate-200 mb-10 font-light tracking-wide">{s.subtitle}</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setView('SERVICES')} className="px-8 py-4 bg-primary hover:bg-blue-600 text-white font-bold rounded shadow-[0_0_20px_rgba(70,130,180,0.4)] transition-all transform hover:scale-105 flex items-center gap-2">
                    VER SERVICIOS <ArrowRight size={20} />
                  </button>
                  <button onClick={() => {
                    const el = document.getElementById('contact-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }} className="px-8 py-4 border border-white/30 hover:bg-white/10 text-white font-bold rounded backdrop-blur transition-all">
                    CONTACTAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} className={`w-3 h-3 rounded-full transition-all ${i === slide ? 'bg-primary w-8' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>
    );
  };

  const CustomServiceSection = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);
    const [requestData, setRequestData] = useState<CustomRequestData>({
      style: '',
      description: '',
      paymentMethod: 'card',
      cardDetails: { number: '', expiry: '', cvc: '', holder: '' }
    });

    const styles = [
      'Animación 2D Vectorial', 'Animación Tradicional (Frame-by-frame)', 
      '3D Realista', '3D Low Poly', 
      'Motion Graphics Corporativo', 'Stop Motion Digital'
    ];

    const handleNext = () => {
      if (step === 1) {
        if (!requestData.style || !requestData.description) {
          notify('Por favor completa todos los campos del proyecto', 'error');
          return;
        }
        setStep(2);
      } else if (step === 2) {
        // Validate Payment
        if (requestData.paymentMethod === 'card') {
           if (!requestData.cardDetails?.number || !requestData.cardDetails?.cvc) {
             notify('Por favor completa los datos de la tarjeta', 'error');
             return;
           }
        }
        
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(3);
          
          // Create a mock order for this custom request
          if (currentUser) {
            const newOrder: Order = {
              id: `CUST-${Date.now()}`,
              userId: currentUser.id,
              userEmail: currentUser.email,
              userName: currentUser.name,
              date: new Date().toISOString(),
              items: [{ serviceId: 'custom', serviceName: `Custom: ${requestData.style}`, price: 100, quantity: 1 }],
              total: 100, // Deposit fee
              status: 'pending',
              priority: 'urgent',
              specifications: {
                style: requestData.style,
                software: [],
                description: requestData.description,
                budgetRange: 'Custom Quote',
                files: []
              }
            };
            const existingOrders = JSON.parse(localStorage.getItem('phk_orders') || '[]');
            localStorage.setItem('phk_orders', JSON.stringify([...existingOrders, newOrder]));
            setOrders([...existingOrders, newOrder]);
          }
        }, 2000);
      }
    };

    return (
      <div className="mt-20 border-t border-slate-800 pt-16" id="custom-request">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-secondary font-bold tracking-widest uppercase text-sm">¿Algo Único?</span>
            <h2 className="text-3xl font-orbitron font-bold text-white mt-2">SOLICITUD DE ANIMACIÓN PERSONALIZADA</h2>
            <p className="text-slate-400 mt-2">Describe tu idea y comienza la producción hoy mismo.</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-1 border border-slate-700 shadow-2xl relative overflow-hidden">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-dark">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${(step / 3) * 100}%` }} 
              />
            </div>

            <div className="p-8 md:p-12">
              {step === 1 && (
                <div className="animate-fade-in">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Detalles del Proyecto
                  </h3>
                  
                  <div className="mb-6">
                    <label className="block text-slate-300 text-sm font-bold mb-2">Estilo de Animación Preferido</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {styles.map(s => (
                        <div 
                          key={s} 
                          onClick={() => setRequestData({...requestData, style: s})}
                          className={`p-3 rounded border cursor-pointer text-sm text-center transition-all ${requestData.style === s ? 'border-primary bg-primary/20 text-white' : 'border-slate-700 hover:border-slate-500 text-slate-400'}`}
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-slate-300 text-sm font-bold mb-2">Descripción Detallada</label>
                    <textarea 
                      value={requestData.description}
                      onChange={e => setRequestData({...requestData, description: e.target.value})}
                      placeholder="Describe qué deseas animar, la duración aproximada, el propósito del video y cualquier referencia visual..."
                      className="w-full h-40 bg-dark border border-slate-700 rounded p-4 text-white focus:border-primary focus:outline-none resize-none"
                    ></textarea>
                  </div>

                  <button 
                    onClick={handleNext}
                    className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded transition-all flex items-center justify-center gap-2"
                  >
                    CONTINUAR AL PAGO <ArrowRight size={20} />
                  </button>
                  <p className="text-xs text-center text-slate-500 mt-4">* Se requiere un depósito inicial de $100 USD para iniciar la consultoría y bocetaje.</p>
                </div>
              )}

              {step === 2 && (
                <div className="animate-fade-in">
                  <button onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white mb-4 flex items-center gap-1">← Volver</button>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="bg-primary w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Pago Seguro del Depósito ($100.00)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <label className="block text-slate-300 text-sm font-bold mb-4">Método de Pago</label>
                      <div className="space-y-3">
                        <div 
                          onClick={() => setRequestData({...requestData, paymentMethod: 'card'})}
                          className={`p-4 rounded border cursor-pointer flex items-center justify-between ${requestData.paymentMethod === 'card' ? 'border-primary bg-primary/10' : 'border-slate-700'}`}
                        >
                          <span className="flex items-center gap-2"><CreditCard size={20}/> Tarjeta de Crédito/Débito</span>
                          {requestData.paymentMethod === 'card' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                        </div>
                        <div 
                          onClick={() => setRequestData({...requestData, paymentMethod: 'paypal'})}
                          className={`p-4 rounded border cursor-pointer flex items-center justify-between ${requestData.paymentMethod === 'paypal' ? 'border-primary bg-primary/10' : 'border-slate-700'}`}
                        >
                          <span className="flex items-center gap-2 font-bold italic"><span className="text-blue-500">Pay</span><span className="text-blue-300">Pal</span></span>
                          {requestData.paymentMethod === 'paypal' && <div className="w-3 h-3 bg-primary rounded-full"></div>}
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface p-6 rounded border border-slate-700">
                      {requestData.paymentMethod === 'card' ? (
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Titular de la Tarjeta</label>
                            <input type="text" placeholder="Nombre como aparece en la tarjeta" className="w-full bg-dark border border-slate-600 rounded p-2 text-white text-sm" 
                              value={requestData.cardDetails?.holder}
                              onChange={e => setRequestData({...requestData, cardDetails: {...requestData.cardDetails!, holder: e.target.value}})}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Número de Tarjeta</label>
                            <div className="relative">
                              <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-dark border border-slate-600 rounded p-2 pl-10 text-white text-sm" 
                                value={requestData.cardDetails?.number}
                                onChange={e => setRequestData({...requestData, cardDetails: {...requestData.cardDetails!, number: e.target.value}})}
                              />
                              <CreditCard className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">Expiración</label>
                              <input type="text" placeholder="MM/YY" className="w-full bg-dark border border-slate-600 rounded p-2 text-white text-sm" 
                                value={requestData.cardDetails?.expiry}
                                onChange={e => setRequestData({...requestData, cardDetails: {...requestData.cardDetails!, expiry: e.target.value}})}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-400 mb-1 block">CVC</label>
                              <input type="text" placeholder="123" className="w-full bg-dark border border-slate-600 rounded p-2 text-white text-sm" 
                                value={requestData.cardDetails?.cvc}
                                onChange={e => setRequestData({...requestData, cardDetails: {...requestData.cardDetails!, cvc: e.target.value}})}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                          <p className="mb-4 text-sm text-slate-300">Serás redirigido a PayPal para completar tu pago de forma segura.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleNext}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Procesando...</span>
                    ) : (
                      <>CONFIRMAR PAGO Y ENVIAR <Shield size={20} /></>
                    )}
                  </button>
                  <p className="text-center mt-4 text-slate-500 text-xs flex items-center justify-center gap-1"><Lock size={12}/> Transacción encriptada de 256-bits</p>
                </div>
              )}

              {step === 3 && (
                <div className="animate-fade-in text-center py-12">
                  <div className="w-24 h-24 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h3 className="text-3xl font-orbitron font-bold text-white mb-4">¡Pago Exitoso!</h3>
                  <p className="text-xl text-slate-300 mb-8 max-w-lg mx-auto">
                    Tu solicitud personalizada ha sido recibida correctamente. Hemos enviado un recibo a tu correo electrónico.
                  </p>
                  <div className="bg-surface p-6 rounded border border-slate-700 max-w-md mx-auto mb-8 text-left">
                    <p className="text-sm text-slate-400 mb-2">ID Transacción: <span className="text-white font-mono">TX-{Date.now().toString().slice(-8)}</span></p>
                    <p className="text-sm text-slate-400 mb-2">Concepto: <span className="text-white">Depósito Proyecto Personalizado</span></p>
                    <p className="text-sm text-slate-400">Total Pagado: <span className="text-green-400 font-bold">$100.00 USD</span></p>
                  </div>
                  <button 
                    onClick={() => {
                      setStep(1);
                      setRequestData({ style: '', description: '', paymentMethod: 'card', cardDetails: { number: '', expiry: '', cvc: '', holder: '' } });
                    }}
                    className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded transition-all"
                  >
                    SOLICITAR OTRO PROYECTO
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ServicesList = () => {
    const categories: ServiceCategory[] = ['ILUSTRACIÓN DIGITAL', 'ANIMACIÓN 2D', 'ANIMACIÓN 3D', 'MOTION GRAPHICS', 'CHARACTER DESIGN', 'STORYBOARDS'];
    const filteredServices = services.filter(s => 
      s.active && 
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
       s.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
      <div className="min-h-screen py-12 px-4 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-orbitron font-bold mb-4 text-white">NUESTROS SERVICIOS</h2>
          <div className="max-w-xl mx-auto relative">
            <input 
              type="text" 
              placeholder="Buscar servicio..." 
              className="w-full bg-surface border border-slate-700 rounded-full py-3 px-12 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          </div>
        </div>

        {categories.map(cat => {
          const catServices = filteredServices.filter(s => s.category === cat);
          if (catServices.length === 0) return null;
          return (
            <div key={cat} className="mb-16">
              <h3 className="text-2xl font-bold text-primary mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-secondary rounded-sm"></span>
                {cat}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {catServices.map(service => (
                  <div key={service.id} className="bg-surface border border-slate-800 rounded-xl overflow-hidden hover:shadow-[0_0_30px_rgba(70,130,180,0.15)] transition-all group">
                    <div className="h-48 overflow-hidden relative">
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs text-white">
                        {service.deliveryTime}
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-white mb-2">{service.name}</h4>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {service.variations.map(v => (
                          <span key={v} className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">{v}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-white">
                          <span className="text-2xl font-bold text-primary">${service.price}</span>
                          <span className="text-xs text-slate-500 ml-1">/{service.unit}</span>
                        </div>
                        <button 
                          onClick={() => addToCart(service)}
                          className="bg-slate-700 hover:bg-white hover:text-black text-white p-2 rounded-full transition-all"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {/* New Custom Service Section */}
        <CustomServiceSection />
      </div>
    );
  };

  const Portfolio = () => {
    const [filter, setFilter] = useState<'ALL' | 'FRAME_BY_FRAME' | 'ILLUSTRATION'>('ALL');
    const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

    const filteredItems = MOCK_PORTFOLIO.filter(item => {
      if (filter === 'ALL') return true;
      return item.category === filter;
    });

    return (
      <div className="min-h-screen py-12 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-orbitron font-bold text-white mb-4">PORTFOLIO</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Una selección de nuestros mejores trabajos en animación e ilustración.</p>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-6 py-2 rounded-full border transition-all ${filter === 'ALL' ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilter('FRAME_BY_FRAME')}
            className={`px-6 py-2 rounded-full border transition-all ${filter === 'FRAME_BY_FRAME' ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
          >
            Animación Frame-by-Frame
          </button>
          <button 
            onClick={() => setFilter('ILLUSTRATION')}
            className={`px-6 py-2 rounded-full border transition-all ${filter === 'ILLUSTRATION' ? 'bg-primary border-primary text-white' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
          >
            Ilustración Digital
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div 
              key={item.id} 
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-surface aspect-square"
              onClick={() => setLightboxItem(item)}
            >
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                <h4 className="font-bold text-white text-lg mb-1">{item.title}</h4>
                <p className="text-primary text-xs uppercase tracking-wider mb-3">
                  {item.category === 'FRAME_BY_FRAME' ? 'Animación' : 'Ilustración'}
                </p>
                <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
                  <ZoomIn className="text-white" size={20} />
                </div>
              </div>
              {item.category === 'FRAME_BY_FRAME' && (
                <div className="absolute top-3 right-3 bg-black/50 p-1.5 rounded-full backdrop-blur-sm">
                  <Play className="text-white w-4 h-4 fill-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {lightboxItem && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setLightboxItem(null)}>
            <div className="max-w-5xl w-full bg-surface border border-slate-700 rounded-2xl overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setLightboxItem(null)}
                className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-primary transition-colors"
              >
                <X size={24} />
              </button>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3 bg-black flex items-center justify-center min-h-[400px] md:min-h-[600px]">
                  <img src={lightboxItem.image} alt={lightboxItem.title} className="max-w-full max-h-[80vh] object-contain" />
                </div>
                <div className="md:w-1/3 p-8 flex flex-col justify-center">
                  <span className="text-primary text-sm font-bold uppercase tracking-widest mb-2">
                    {lightboxItem.category === 'FRAME_BY_FRAME' ? 'Animación Frame-by-Frame' : 'Ilustración Digital'}
                  </span>
                  <h3 className="text-3xl font-orbitron font-bold text-white mb-4">{lightboxItem.title}</h3>
                  <p className="text-slate-400 mb-6 leading-relaxed">
                    {lightboxItem.description}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-slate-800">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cliente</p>
                    <p className="text-white font-medium">{lightboxItem.client}</p>
                  </div>

                  <button 
                    onClick={() => {
                      setLightboxItem(null);
                      const el = document.getElementById('custom-request');
                      if (el) {
                        setView('SERVICES');
                        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
                      } else {
                        setView('SERVICES');
                      }
                    }}
                    className="mt-8 w-full bg-slate-800 hover:bg-primary text-white py-3 rounded transition-colors font-bold text-sm"
                  >
                    SOLICITAR ALGO SIMILAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const Checkout = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      style: 'Realista',
      software: [],
      budget: '$100-500',
      specs: '',
      paymentMethod: 'credit_card'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<string[]>([]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const newFiles = Array.from(e.target.files).map(f => f.name);
        setFiles(prev => [...prev, ...newFiles].slice(0, 3));
      }
    };

    const submitOrder = () => {
      if (!currentUser) {
        notify('Debes iniciar sesión para completar el pedido', 'error');
        setIsLoginOpen(true);
        return;
      }

      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: formData.name,
        date: new Date().toISOString(),
        items: [...cart],
        total,
        status: 'pending',
        priority: 'normal',
        specifications: {
          style: formData.style,
          software: [], // Simplified for demo
          description: formData.specs,
          budgetRange: formData.budget,
          files
        }
      };

      const existingOrders = JSON.parse(localStorage.getItem('phk_orders') || '[]');
      const updatedOrders = [...existingOrders, newOrder];
      localStorage.setItem('phk_orders', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      setCart([]);
      notify('¡Pedido enviado con éxito!', 'success');
      setView('PROFILE');
    };

    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-orbitron font-bold mb-8 text-white border-b border-slate-700 pb-4">CHECKOUT</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Contact Info */}
            <div className="bg-surface p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Datos de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-dark border border-slate-700 p-3 rounded text-white" />
                <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-dark border border-slate-700 p-3 rounded text-white" />
                <input type="tel" placeholder="Teléfono (Opcional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-dark border border-slate-700 p-3 rounded text-white" />
              </div>
            </div>

            {/* Step 2: Project Specs */}
            <div className="bg-surface p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Especificaciones del Proyecto
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <select className="bg-dark border border-slate-700 p-3 rounded text-white" value={formData.style} onChange={e => setFormData({...formData, style: e.target.value})}>
                     <option>Realista</option>
                     <option>Cartoon</option>
                     <option>Anime</option>
                     <option>Low Poly</option>
                   </select>
                   <select className="bg-dark border border-slate-700 p-3 rounded text-white" value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}>
                     <option>$100 - $500</option>
                     <option>$500 - $1000</option>
                     <option>$1000+</option>
                     <option>Presupuesto Personalizado</option>
                   </select>
                </div>
                <textarea 
                  placeholder="Describe tu proyecto en detalle..." 
                  className="w-full bg-dark border border-slate-700 p-3 rounded text-white h-32"
                  value={formData.specs}
                  onChange={e => setFormData({...formData, specs: e.target.value})}
                ></textarea>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-400">Arrastra archivos o haz clic para subir referencias</p>
                  <p className="text-xs text-slate-600 mt-1">(Máx 3 archivos, JPG/PNG/PDF)</p>
                  <input type="file" ref={fileInputRef} className="hidden" multiple onChange={handleFileChange} />
                </div>
                {files.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {files.map((f, i) => <span key={i} className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">{f}</span>)}
                  </div>
                )}
              </div>
            </div>

             {/* Step 3: Payment */}
             <div className="bg-surface p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Método de Pago (Simulado)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'credit_card'})}
                  className={`p-4 rounded border ${formData.paymentMethod === 'credit_card' ? 'border-primary bg-primary/10' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  Tarjeta Crédito/Débito
                </button>
                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'paypal'})}
                  className={`p-4 rounded border ${formData.paymentMethod === 'paypal' ? 'border-primary bg-primary/10' : 'border-slate-700 hover:border-slate-500'}`}
                >
                  PayPal
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-surface p-6 rounded-xl border border-slate-800 sticky top-24">
              <h3 className="text-xl font-bold mb-4">Resumen</h3>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.quantity}x {item.serviceName}</span>
                    <span className="font-medium">${item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-700 pt-4 flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span className="text-primary">${total}</span>
              </div>
              <button 
                onClick={submitOrder}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-4 rounded shadow-lg transform transition-all hover:scale-[1.02]"
              >
                CONFIRMAR PEDIDO
              </button>
              <p className="text-xs text-center text-slate-500 mt-4">
                <Shield size={12} className="inline mr-1" />
                Pago 100% Seguro y Encriptado
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AdminDashboard = () => {
    if (!currentUser || currentUser.role !== 'admin') {
      return <div className="p-12 text-center">Acceso denegado. <button onClick={() => setView('HOME')} className="text-primary">Volver</button></div>;
    }

    const revenue = orders.filter(o => o.status === 'completed').reduce((acc, o) => acc + o.total, 0);
    const pending = orders.filter(o => o.status === 'pending').length;

    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-orbitron font-bold text-white">PANEL ADMINISTRACIÓN</h2>
          <button onClick={logout} className="flex items-center gap-2 text-secondary hover:text-red-400">
            <LogOut size={20} /> Salir
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-4 bg-primary/20 rounded-full text-primary"><Package size={32} /></div>
            <div>
              <p className="text-slate-400 text-sm">Pedidos Totales</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-4 bg-yellow-500/20 rounded-full text-yellow-500"><AlertCircle size={32} /></div>
            <div>
              <p className="text-slate-400 text-sm">Pendientes</p>
              <p className="text-2xl font-bold">{pending}</p>
            </div>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-slate-800 flex items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-full text-green-500"><BarChart size={32} /></div>
            <div>
              <p className="text-slate-400 text-sm">Ingresos (Simulados)</p>
              <p className="text-2xl font-bold">${revenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="font-bold text-lg">Pedidos Recientes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-darker text-slate-400 text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-slate-400">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{order.userName}</div>
                      <div className="text-xs text-slate-500">{order.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">{order.items.length} items ({order.items[0]?.serviceName}...)</td>
                    <td className="px-6 py-4 font-bold text-primary">${order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                          order.status === 'in_progress' ? 'bg-blue-500/20 text-blue-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="bg-dark border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        value={order.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as Order['status'];
                          const updated = orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o);
                          setOrders(updated);
                          localStorage.setItem('phk_orders', JSON.stringify(updated));
                        }}
                      >
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En Progreso</option>
                        <option value="completed">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const UserProfile = () => {
    if (!currentUser) return null;
    const userOrders = orders.filter(o => o.userId === currentUser.id);

    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-orbitron font-bold text-white">{currentUser.name}</h2>
            <p className="text-slate-400">{currentUser.email}</p>
            <button onClick={logout} className="mt-2 text-sm text-secondary hover:underline">Cerrar Sesión</button>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-6 border-b border-slate-800 pb-2">Historial de Pedidos</h3>
        <div className="space-y-4">
          {userOrders.length === 0 ? (
            <p className="text-slate-500 italic">No has realizado pedidos aún.</p>
          ) : (
            userOrders.map(order => (
              <div key={order.id} className="bg-surface p-6 rounded-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-primary font-bold">{order.id}</span>
                    <span className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    {order.items.map(i => i.serviceName).join(', ')}
                  </div>
                </div>
                <div className="text-right flex flex-col md:items-end w-full md:w-auto">
                  <span className="text-xl font-bold text-white">${order.total}</span>
                  <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded mt-1 inline-block
                    ${order.status === 'completed' ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}
                  `}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const AuthModal = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    if (!isLoginOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
          <div className="p-6 bg-darker border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-xl font-orbitron font-bold">{isRegister ? 'CREAR CUENTA' : 'INICIAR SESIÓN'}</h3>
            <button onClick={() => setIsLoginOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
          </div>
          <div className="p-8 space-y-4">
            {isRegister && (
              <input 
                type="text" 
                placeholder="Nombre Completo" 
                className="w-full bg-dark border border-slate-700 p-3 rounded text-white focus:border-primary focus:outline-none"
                value={name} onChange={e => setName(e.target.value)}
              />
            )}
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full bg-dark border border-slate-700 p-3 rounded text-white focus:border-primary focus:outline-none"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="w-full bg-dark border border-slate-700 p-3 rounded text-white focus:border-primary focus:outline-none"
              value={password} onChange={e => setPassword(e.target.value)}
            />
            <button 
              onClick={() => isRegister ? handleRegister(name, email, password) : handleLogin(email, password)}
              className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-3 rounded transition-all transform hover:scale-[1.02]"
            >
              {isRegister ? 'REGISTRARSE' : 'ENTRAR'}
            </button>
            <div className="text-center text-sm text-slate-400 mt-4">
              {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
              <button onClick={() => setIsRegister(!isRegister)} className="text-primary hover:underline ml-1 font-bold">
                {isRegister ? 'Inicia Sesión' : 'Regístrate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CartDrawer = () => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
      <>
        {isCartOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsCartOpen(false)} />}
        <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-slate-800 z-50 transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-darker">
              <h2 className="text-xl font-orbitron font-bold flex items-center gap-2"><ShoppingCart size={20}/> TU CARRITO</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <ShoppingCart size={48} className="mx-auto mb-4 opacity-30" />
                  <p>Tu carrito está vacío</p>
                  <button onClick={() => { setIsCartOpen(false); setView('SERVICES'); }} className="mt-4 text-primary hover:underline">Ver Servicios</button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="bg-dark p-4 rounded-lg flex justify-between items-center border border-slate-800">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.serviceName}</h4>
                      <p className="text-primary font-mono text-sm">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-surface rounded border border-slate-700">
                        <button className="px-2 py-1 hover:bg-white/10" onClick={() => {
                          const newCart = [...cart];
                          if (newCart[idx].quantity > 1) {
                            newCart[idx].quantity--;
                            setCart(newCart);
                          } else {
                            removeFromCart(item.serviceId);
                          }
                        }}><Minus size={14}/></button>
                        <span className="px-2 text-sm">{item.quantity}</span>
                        <button className="px-2 py-1 hover:bg-white/10" onClick={() => {
                           const newCart = [...cart];
                           newCart[idx].quantity++;
                           setCart(newCart);
                        }}><Plus size={14}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.serviceId)} className="text-red-500 hover:text-red-400"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-darker border-t border-slate-800">
                <div className="flex justify-between mb-6 text-xl font-bold">
                  <span>Total Estimado:</span>
                  <span className="text-primary">${total}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setView('CHECKOUT'); }}
                  className="w-full bg-secondary hover:bg-red-700 text-white font-bold py-3 rounded transition-colors"
                >
                  PROCESAR PAGO
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const Footer = () => (
    <footer className="bg-darker border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="text-2xl font-orbitron font-bold text-white mb-4">PHK<span className="text-secondary">Studio</span></div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transformamos ideas en experiencias visuales de alto impacto. Especialistas en animación, modelado 3D y narrativa visual.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider">Servicios</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-primary">Animación 3D</a></li>
              <li><a href="#" className="hover:text-primary">Motion Graphics</a></li>
              <li><a href="#" className="hover:text-primary">Ilustración</a></li>
              <li><a href="#" className="hover:text-primary">Concept Art</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-primary">Términos y Condiciones</a></li>
              <li><a href="#" className="hover:text-primary">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-primary">Política de Reembolso</a></li>
            </ul>
          </div>
          <div id="contact-section">
            <h4 className="font-bold text-white mb-4 uppercase tracking-wider">Contacto</h4>
            <div className="flex gap-4 mb-4">
              <Instagram className="text-slate-400 hover:text-secondary cursor-pointer" />
              <Youtube className="text-slate-400 hover:text-secondary cursor-pointer" />
              <Facebook className="text-slate-400 hover:text-secondary cursor-pointer" />
              <Linkedin className="text-slate-400 hover:text-secondary cursor-pointer" />
            </div>
            <p className="text-sm text-slate-400">info@phkstudio.com</p>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          &copy; 2025 PHKStudio. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );

  const FloatingAdminBtn = () => {
    // Hidden "Admin" login trigger for staff
    return (
      <button 
        onClick={() => {
          if (currentUser?.role === 'admin') setView('ADMIN');
          else setIsLoginOpen(true);
        }}
        className="fixed bottom-4 left-4 z-40 bg-slate-800/50 hover:bg-slate-700 text-slate-500 p-2 rounded-full backdrop-blur transition-all"
        title="Staff Access"
      >
        <Settings size={16} />
      </button>
    );
  };

  const ChatWidget = () => (
    <a 
      href="#" // Simulated link
      onClick={(e) => { e.preventDefault(); notify('Conectando con WhatsApp...', 'info'); }}
      className="fixed bottom-6 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-900/40 hover:scale-110 transition-transform"
    >
      <MessageCircle size={28} />
    </a>
  );

  return (
    <div className="min-h-screen bg-dark text-slate-200 font-sans selection:bg-primary selection:text-white">
      <Navbar />
      
      <main>
        {view === 'HOME' && (
          <>
            <Hero />
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
        
        {view === 'SERVICES' && <ServicesList />}
        {view === 'PORTFOLIO' && <Portfolio />}
        {view === 'CART' && (cart.length > 0 ? <Checkout /> : <div className="p-20 text-center">Tu carrito está vacío</div>)}
        {view === 'CHECKOUT' && <Checkout />}
        {view === 'PROFILE' && <UserProfile />}
        {view === 'ADMIN' && <AdminDashboard />}
      </main>

      <Footer />
      <AuthModal />
      <CartDrawer />
      <FloatingAdminBtn />
      <ChatWidget />
      <Toast notifications={notifications} remove={(id) => setNotifications(prev => prev.filter(n => n.id !== id))} />
      <CookieConsent />
    </div>
  );
}
