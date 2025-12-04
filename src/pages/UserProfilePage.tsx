import React, { useEffect, useState } from 'react';
import { User, Order, OrderItem } from '../types';
import { supabase } from '../integrations/supabase/client';

interface UserProfilePageProps {
  currentUser: User | null;
  orders: Order[];
  logout: () => void;
}

const UserProfilePage: React.FC<UserProfilePageProps> = ({ currentUser, orders, logout }) => {
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id, service_id, service_name, price, quantity, variations
          )
        `)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
      } else {
        const fetchedOrders: Order[] = data.map((order: any) => ({
          ...order,
          items: order.order_items || [],
          specifications: order.specifications || {},
        }));
        setUserOrders(fetchedOrders);
      }
      setLoading(false);
    };

    fetchUserOrders();
  }, [currentUser]);

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <div className="flex items-center gap-6 mb-12">
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-lg">
          {currentUser.first_name ? currentUser.first_name.charAt(0) : currentUser.email.charAt(0)}
        </div>
        <div>
          <h2 className="text-3xl font-orbitron font-bold text-white">{currentUser.first_name} {currentUser.last_name}</h2>
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
                  <span className="font-mono text-primary font-bold">{order.id.substring(0, 8)}...</span>
                  <span className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-slate-300 mt-1">
                  {order.items.map(i => i.service_name).join(', ')}
                </div>
              </div>
              <div className="text-right flex flex-col md:items-end w-full md:w-auto">
                <span className="text-xl font-bold text-white">${order.total.toFixed(2)}</span>
                <span className={`text-xs uppercase font-bold px-2 py-0.5 rounded mt-1 inline-block
                  ${order.status === 'completed' ? 'text-green-400 bg-green-400/10' : 
                   order.status === 'pending' ? 'text-yellow-400 bg-yellow-400/10' :
                   order.status === 'in_progress' ? 'text-blue-400 bg-blue-400/10' : 'text-red-400 bg-red-400/10'}
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

export default UserProfilePage;