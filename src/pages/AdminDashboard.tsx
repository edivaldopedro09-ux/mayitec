import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/api';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Plus, 
  Minus, 
  Layers, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';

type TabType = 'orders' | 'products' | 'users';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Função auxiliar para resolver a URL das imagens dinamicamente
  const getImageUrl = (path: string) => {
    if (!path) return ''; 
    if (path.startsWith('http')) return path; 
    
    // Obtém a URL do backend (ex: https://mayitec-backend.onrender.com)
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Remove o '/api' da URL caso exista (o VITE_API_URL aponta para a api, mas uploads ficam na raiz)
    const baseUrl = apiBase.replace(/\/api$/, '');
    
    // Garante o formato correto do caminho
    const formattedPath = path.startsWith('/') ? path : `/${path}`;
    
    return `${baseUrl}${formattedPath}`;
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        API.get('/orders'),
        API.get('/products'),
        API.get('/users').catch(() => ({ data: [] }))
      ]);
      
      setOrders(ordersRes.data);
      setProducts(productsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Erro ao sincronizar dados do painel:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch (err) { 
      alert("Erro ao atualizar o estado do pedido."); 
    }
  };

  const handleUpdateStock = async (id: string, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);
    try {
      await API.put(`/products/${id}`, { stock: newStock });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      alert("Erro ao atualizar a quantidade em stock.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Tens a certeza de que desejas remover o produto "${name}"?`)) {
      try {
        await API.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        alert("Erro ao remover o produto.");
      }
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Remover permanentemente o utilizador "${name}"?`)) {
      try {
        await API.delete(`/users/${id}`);
        setUsers(prev => prev.filter(u => u._id !== id));
      } catch (err) {
        alert("Erro ao remover o cliente.");
      }
    }
  };

  const filteredOrders = statusFilter === 'Todos' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return <div className="p-20 text-center text-lg font-bold text-gray-500 animate-pulse">A carregar ecossistema administrativo...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 animate-fade-in">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Painel de Controlo</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral do inventário, vendas e utilizadores ativos.</p>
        </div>
        <Link 
          to="/admin/add-product" 
          className="bg-mayitec-purple text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-95 transition flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Novo Produto</span>
        </Link>
      </div>
      
      {/* Grade Avançada de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><ShoppingCart size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Pedidos</h3>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{orders.length}</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600"><ShieldAlert size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Pendentes</h3>
            <p className="text-2xl md:text-3xl font-black text-yellow-500">
              {orders.filter(o => o.status === 'Pendente').length}
            </p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-2xl text-mayitec-purple"><Layers size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Produtos</h3>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{products.length}</p>
          </div>
        </div>

        <div className="p-6 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-2xl text-green-600"><Users size={24} /></div>
          <div>
            <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider">Clientes</h3>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-6 mb-8 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab('orders')} className={`pb-4 text-base font-black border-b-2 transition-all px-2 ${activeTab === 'orders' ? 'border-mayitec-purple text-mayitec-purple' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Pedidos ({orders.length})</button>
        <button onClick={() => setActiveTab('products')} className={`pb-4 text-base font-black border-b-2 transition-all px-2 ${activeTab === 'products' ? 'border-mayitec-purple text-mayitec-purple' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Produtos ({products.length})</button>
        <button onClick={() => setActiveTab('users')} className={`pb-4 text-base font-black border-b-2 transition-all px-2 ${activeTab === 'users' ? 'border-mayitec-purple text-mayitec-purple' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Clientes ({users.length})</button>
      </div>

      {/* --- ABA PRODUTOS (Com imagem corrigida) --- */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-400 text-[11px] font-black tracking-wider border-b uppercase">
                <tr>
                  <th className="p-5">Produto</th>
                  <th className="p-5">Categoria</th>
                  <th className="p-5">Preço Base</th>
                  <th className="p-5 text-center">Stock</th>
                  <th className="p-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border flex-shrink-0">
                        <img 
                          src={getImageUrl(product.imageUrl)} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="font-bold text-gray-800 truncate max-w-xs">{product.name}</span>
                    </td>
                    <td className="p-5 text-gray-500 font-medium">{product.category || 'Sem Categoria'}</td>
                    <td className="p-5 font-black text-gray-900">{product.price?.toLocaleString()} AOA</td>
                    <td className="p-5 text-center">
                       <button onClick={() => handleUpdateStock(product._id, product.stock || 0, -1)} className="p-1 hover:bg-gray-200 rounded">-</button>
                       <span className="px-3 font-bold">{product.stock || 0}</span>
                       <button onClick={() => handleUpdateStock(product._id, product.stock || 0, 1)} className="p-1 hover:bg-gray-200 rounded">+</button>
                    </td>
                    <td className="p-5 text-center">
                      <button onClick={() => handleDeleteProduct(product._id, product.name)} className="text-gray-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adicionar aqui as outras abas (orders/users) conforme o código original */}
      {/* Omiti por brevidade, mas a estrutura permanece igual */}
    </div>
  );
};

export default AdminDashboard;