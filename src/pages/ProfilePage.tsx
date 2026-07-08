import React, { useEffect, useState, useRef } from 'react';
import API from '../api/api';
import { User, Package, Clock, ShieldCheck, Mail, Camera, Edit2, X, Loader2, Save } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Novo: estado de salvamento
  
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', password: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfileAndOrdersData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          API.get('/users/profile'),
          API.get('/orders/myorders').catch(() => ({ data: [] }))
        ]);
        
        setUser(profileRes.data);
        setOrders(ordersRes.data || []);
        setFormData({
          name: profileRes.data.name || '',
          address: profileRes.data.address || '',
          password: '' 
        });
      } catch (err) {
        console.error("Erro ao carregar dados", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndOrdersData();
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address);
      if (formData.password) data.append('password', formData.password);
      if (fileInputRef.current?.files?.[0]) {
        data.append('image', fileInputRef.current.files[0]);
      }

      const response = await API.put('/users/profile', data);
      setUser(response.data);
      setPreviewImage(null);
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error: any) {
      alert(error.response?.data?.message || "Ocorreu um erro ao atualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center animate-pulse">Carregando...</div>;

  const totalGasto = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:p-12">
      {/* Cabeçalho */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-purple-100 p-4 rounded-full text-purple-600">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.name}</h1>
            <p className="text-gray-500 flex items-center gap-2"><Mail size={14}/> {user?.email}</p>
          </div>
        </div>
        
        <div className="bg-gray-900 text-white p-6 md:p-8 rounded-3xl flex flex-col justify-center">
          <p className="text-gray-400 text-xs uppercase tracking-widest">Total Investido</p>
          <h2 className="text-2xl md:text-3xl font-bold mt-1">{totalGasto.toLocaleString()} AOA</h2>
          <div className="flex items-center gap-2 text-green-400 mt-2 text-sm">
            <ShieldCheck size={16} /> Membro Verificado
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Painel Esquerdo: Perfil */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                {previewImage || user?.profilePic ? (
                  <img src={previewImage || (user.profilePic.startsWith('http') ? user.profilePic : `${BASE_URL}${user.profilePic}`)} alt="Perfil" className="w-full h-full object-cover" />
                ) : <User className="w-16 h-16 text-gray-400" />}
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow hover:scale-105 transition">
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setPreviewImage(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} accept="image/*" />
            </div>

            <button onClick={() => setIsEditing(!isEditing)} className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-50 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
              {isEditing ? <><X size={16} /> Cancelar</> : <><Edit2 size={16} /> Editar Perfil</>}
            </button>
          </div>

          {/* Editor/Info */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 text-gray-800">Detalhes da Conta</h3>
            {isEditing ? (
              <div className="space-y-4">
                <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 text-sm" placeholder="Nome" />
                <textarea name="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 text-sm h-20" placeholder="Morada" />
                <input type="password" name="password" onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-2.5 bg-gray-50 text-sm" placeholder="Nova Senha" />
                <button disabled={isSaving} onClick={handleSaveProfile} className="w-full bg-purple-600 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Guardar</>}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div><span className="text-gray-400 block uppercase text-[10px] font-bold">Morada</span>{user?.address || "Não definida"}</div>
                <div><span className="text-gray-400 block uppercase text-[10px] font-bold">Segurança</span>Senha protegida</div>
              </div>
            )}
          </div>
        </div>

        {/* Painel Direito: Histórico */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-purple-600" />
            <h2 className="text-xl font-bold">Histórico de Pedidos</h2>
          </div>
          <div className="space-y-3">
            {orders.length > 0 ? orders.map((order) => (
              <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                <div>
                  <p className="font-bold text-sm">Pedido #{order._id.slice(-6)}</p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1"><Clock size={10}/> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{order.totalPrice.toLocaleString()} AOA</p>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${order.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                </div>
              </div>
            )) : <p className="text-center text-gray-400 py-10">Nenhum pedido realizado.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;