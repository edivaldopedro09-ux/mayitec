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
  // Estados Globais de Dados
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Estados de Controlo de UI
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [statusFilter, setStatusFilter] = useState('Todos');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Executa as chamadas em paralelo para máxima velocidade de carregamento
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        API.get('/orders'),
        API.get('/products'),
        API.get('/users').catch(() => ({ data: [] })) // Fallback caso a rota de users ainda não exista
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

  // --- GESTÃO DE PEDIDOS ---
  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await API.put(`/orders/${id}/status`, { status: newStatus });
      // Atualiza apenas os pedidos para evitar re-render completo de loading
      const { data } = await API.get('/orders');
      setOrders(data);
    } catch (err) { 
      alert("Erro ao atualizar o estado do pedido."); 
    }
  };

  // --- GESTÃO DE PRODUTOS (STOCK & ELIMINAÇÃO) ---
  const handleUpdateStock = async (id: string, currentStock: number, change: number) => {
    const newStock = Math.max(0, currentStock + change);
    try {
      // Ajusta o stock enviando a atualização para a tua API de produtos
      await API.put(`/products/${id}`, { stock: newStock });
      setProducts(prev => prev.map(p => p._id === id ? { ...p, stock: newStock } : p));
    } catch (err) {
      alert("Erro ao atualizar a quantidade em stock.");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (window.confirm(`Tens a certeza de que desejas remover o produto "${name}" do catálogo?`)) {
      try {
        await API.delete(`/products/${id}`);
        setProducts(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        alert("Erro ao remover o produto.");
      }
    }
  };

  // --- GESTÃO DE CLIENTES ---
  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Remover permanentemente o utilizador/cliente "${name}"?`)) {
      try {
        await API.delete(`/users/${id}`);
        setUsers(prev => prev.filter(u => u._id !== id));
      } catch (err) {
        alert("Erro ao remover o cliente.");
      }
    }
  };

  // Filtro lógico de Pedidos
  const filteredOrders = statusFilter === 'Todos' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  if (loading) {
    return <div className="p-20 text-center text-lg font-bold text-gray-500 animate-pulse">A carregar ecossistema administrativo...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 animate-fade-in">
      
      {/* Cabeçalho de Identidade */}
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
      
      {/* Grade Avançada de Métricas Corporativas */}
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

      {/* Sistema Moderno de Abas (Tabs Selector) */}
      <div className="flex border-b border-gray-100 gap-6 mb-8 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-base font-black border-b-2 transition-all px-2 ${
            activeTab === 'orders' ? 'border-mayitec-purple text-mayitec-purple' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Gestão de Pedidos ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('products')}
          className={`pb-4 text-base font-black border-b-2 transition-all px-2 ${
            activeTab === 'products' ? 'border-mayitec-purple text-mayitec-purple' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Inventário de Produtos ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-4 text-base font-black border-b-2 transition-all px-2 ${
            activeTab === 'users' ? 'border-mayitec-purple text-mayitec-purple' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Clientes Registados ({users.length})
        </button>
      </div>

      {/* --- ABA 1: CONFIGURAÇÃO DE PEDIDOS --- */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/40">
            <h2 className="text-xl font-black text-gray-900">Histórico de Vendas</h2>
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
              {['Todos', 'Pendente', 'Aprovado', 'Cancelado'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                    statusFilter === status ? 'bg-mayitec-purple text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-400 text-[11px] font-black tracking-wider border-b uppercase">
                <tr>
                  <th className="p-5">Data</th>
                  <th className="p-5">Cliente</th>
                  <th className="p-5">Total</th>
                  <th className="p-5">Canal</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-5 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-5 font-bold text-gray-800">{order.user?.name || 'Cliente Geral'}</td>
                    <td className="p-5 font-black text-gray-900">{order.totalPrice?.toLocaleString()} AOA</td>
                    <td className="p-5"><span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-green-100">{order.paymentMethod || 'WhatsApp'}</span></td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                        order.status === 'Pendente' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 
                        order.status === 'Aprovado' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-5 flex justify-center gap-3">
                      {order.status === 'Pendente' && (
                        <>
                          <button onClick={() => updateOrderStatus(order._id, 'Aprovado')} className="text-green-600 hover:text-green-800 transition p-1" title="Aprovar Encomenda"><CheckCircle size={20}/></button>
                          <button onClick={() => updateOrderStatus(order._id, 'Cancelado')} className="text-red-400 hover:text-red-600 transition p-1" title="Cancelar Encomenda"><XCircle size={20}/></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ABA 2: INVENTÁRIO & QUANTIDADES --- */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-50 bg-gray-50/40">
            <h2 className="text-xl font-black text-gray-900">Catálogo Disponível</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-400 text-[11px] font-black tracking-wider border-b uppercase">
                <tr>
                  <th className="p-5">Produto</th>
                  <th className="p-5">Categoria</th>
                  <th className="p-5">Preço Base</th>
                  <th className="p-5 text-center">Controlo de Stock</th>
                  <th className="p-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-5 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 border flex-shrink-0">
                        <img 
                          src={product.imageUrl?.startsWith('http') ? product.imageUrl : `http://localhost:5000${product.imageUrl}`} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="font-bold text-gray-800 truncate max-w-xs">{product.name}</span>
                    </td>
                    <td className="p-5 text-gray-500 font-medium">{product.category || 'Sem Categoria'}</td>
                    <td className="p-5 font-black text-gray-900">{product.price?.toLocaleString()} AOA</td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleUpdateStock(product._id, product.stock || 0, -1)}
                          className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className={`font-black text-base px-3 min-w-8 text-center ${
                          (product.stock || 0) === 0 ? 'text-red-500 font-extrabold' : 'text-gray-800'
                        }`}>
                          {product.stock || 0}
                        </span>
                        <button 
                          onClick={() => handleUpdateStock(product._id, product.stock || 0, 1)}
                          className="p-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <button 
                        onClick={() => handleDeleteProduct(product._id, product.name)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                        title="Eliminar Produto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ABA 3: GESTÃO DE CLIENTES --- */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-50 bg-gray-50/40">
            <h2 className="text-xl font-black text-gray-900">Utilizadores Registados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-400 text-[11px] font-black tracking-wider border-b uppercase">
                <tr>
                  <th className="p-5">Nome Completo</th>
                  <th className="p-5">E-mail de Acesso</th>
                  <th className="p-5">Estatuto</th>
                  <th className="p-5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-gray-400 font-medium">Nenhum utilizador sincronizado ou verificado na base de dados.</td>
                  </tr>
                ) : users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/80 transition">
                    <td className="p-5 font-bold text-gray-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-mayitec-purple flex items-center justify-center font-black text-xs uppercase">
                        {user.name?.substring(0, 2)}
                      </div>
                      <span>{user.name}</span>
                    </td>
                    <td className="p-5 text-gray-500 font-mono text-xs">{user.email}</td>
                    <td className="p-5">
                      {user.isAdmin ? (
                        <span className="bg-purple-50 text-mayitec-purple border border-purple-100 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          Administrador
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-600 border border-gray-200/60 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-center">
                      {!user.isAdmin && (
                        <button 
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          title="Eliminar Utilizador"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;