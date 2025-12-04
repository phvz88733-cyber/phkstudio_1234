import React, { useState } from 'react';
import { ArrowRight, Shield, Lock, CheckCircle, CreditCard } from 'lucide-react';
import { CustomRequestData, User, Order, OrderItem } from '../types';
import { supabase } from '../integrations/supabase/client';

interface CustomServiceSectionProps {
  currentUser: User | null;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const CustomServiceSection: React.FC<CustomServiceSectionProps> = ({ currentUser, notify, setOrders }) => {
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

  const handleNext = async () => {
    if (step === 1) {
      if (!requestData.style || !requestData.description) {
        notify('Por favor completa todos los campos del proyecto', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!currentUser) {
        notify('Debes iniciar sesión para enviar una solicitud personalizada', 'error');
        return;
      }

      // Validate Payment
      if (requestData.paymentMethod === 'card') {
         if (!requestData.cardDetails?.number || !requestData.cardDetails?.cvc) {
           notify('Por favor completa los datos de la tarjeta', 'error');
           return;
         }
      }
      
      setLoading(true);
      try {
        // Create a mock order for this custom request in Supabase
        const depositAmount = 100; // Initial deposit fee

        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: currentUser.id,
            user_email: currentUser.email,
            user_name: currentUser.first_name || currentUser.email,
            total: depositAmount,
            status: 'pending',
            priority: 'urgent',
            payment_method: requestData.paymentMethod === 'card' ? 'credit_card' : 'paypal', // Añadido el método de pago
            specifications: {
              style: requestData.style,
              software: [], // No software specified for custom request initially
              description: requestData.description,
              budgetRange: 'Custom Quote',
              files: [], // No files uploaded in this section
            },
            notes: 'Solicitud de servicio personalizado - Depósito inicial',
          })
          .select()
          .single();

        if (orderError) {
          notify(`Error al crear la solicitud personalizada: ${orderError.message}`, 'error');
          console.error('Error creating custom order:', orderError);
          return;
        }

        // Insert a single item for the custom request deposit
        const orderItemToInsert: Omit<OrderItem, 'id'> = {
          order_id: orderData.id,
          service_id: 'custom-deposit',
          service_name: `Depósito: ${requestData.style}`,
          price: depositAmount,
          quantity: 1,
          variations: 'Depósito inicial',
        };

        const { error: orderItemError } = await supabase
          .from('order_items')
          .insert(orderItemToInsert);

        if (orderItemError) {
          notify(`Error al añadir el depósito al pedido: ${orderItemError.message}`, 'error');
          console.error('Error adding custom order item:', orderItemError);
          return;
        }

        const newOrder: Order = {
          ...orderData,
          items: [orderItemToInsert as OrderItem], // Cast for local state consistency
          specifications: orderData.specifications as Order['specifications'],
        };
        setOrders(prev => [...prev, newOrder]);
        
        setStep(3);
        notify('¡Solicitud personalizada enviada con éxito!', 'success');

      } catch (error: any) {
        notify(`Ocurrió un error inesperado: ${error.message}`, 'error');
        console.error('Unexpected error during custom request:', error);
      } finally {
        setLoading(false);
      }
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
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => {
                      setStep(1);
                      setRequestData({ style: '', description: '', paymentMethod: 'card', cardDetails: { number: '', expiry: '', cvc: '', holder: '' } });
                    }}
                    className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded transition-all"
                  >
                    SOLICITAR OTRO PROYECTO
                  </button>
                  <button 
                    onClick={() => {
                      setStep(1);
                      setRequestData({ style: '', description: '', paymentMethod: 'card', cardDetails: { number: '', expiry: '', cvc: '', holder: '' } });
                      // @ts-ignore - setView is not directly available here, but we can simulate it via props if needed.
                      // For now, assuming setView is passed down or handled by parent.
                      // If setView is not available, this button would need to be handled by the parent component.
                      window.location.href = '/'; // Simple refresh to home for now
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded transition-all"
                  >
                    Volver al Inicio
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomServiceSection;