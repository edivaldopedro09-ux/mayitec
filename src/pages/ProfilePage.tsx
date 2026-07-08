import React, { useEffect, useState, useRef } from 'react';
import API from '../api/api';
import { 
  User, Package, Clock, ShieldCheck, Mail, Camera, 
  Edit2, X, Loader2, Save, LogOut, HelpCircle, Calendar 
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', password: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
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
      alert(error.response?.data?.message || "Erro ao atualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-purple-600" size={40} /></div>;

  const totalGasto = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
      
      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">O meu perfil</h1>
          <p className="text-gray-500 mt-2">Gerencia os teus dados e consulta o teu histórico.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <HelpCircle size={16} /> Ajuda
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-medium hover:bg-red-100 transition">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Coluna Esquerda: Informação Pessoal */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
             {/* Gradient Background no Topo */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-purple-500 to-indigo-600 opacity-5"></div>
            
            <div className="relative text-center pt-8">
              <div className="w-32 h-32 mx-auto rounded-full bg-white p-1 shadow-lg ring-4 ring-white mb-4">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {previewImage || user?.profilePic ? (
                    <img src={previewImage || (user.profilePic.startsWith('http') ? user.profilePic : `${BASE_URL}${user.profilePic}`)} className="w-full h-full object-cover" />
                  ) : <User className="w-16 h-16 text-gray-400" />}
                </div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-28 left-1/2 ml-8 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition">
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setPreviewImage(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)} accept="image/*" />
              
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-purple-600 text-sm font-medium">{user?.email}</p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center py-3 border-t border-gray-50">
                <span className="text-gray-400 text-sm">Membro desde</span>
                <span className="text-gray-900 text-sm font-semibold flex items-center gap-2"><Calendar size={14}/> 2026</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t border-gray-50">
                <span className="text-gray-400 text-sm">Estado</span>
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1"><ShieldCheck size={12}/> Verificado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Editor e Pedidos */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card de Investimento e Editor */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 text-white p-8 rounded-3xl flex flex-col justify-between shadow-2xl shadow-purple-900/20">
              <p className="text-gray-400 text-sm">Total Investido</p>
              <h2 className="text-4xl font-bold">{totalGasto.toLocaleString()} AOA</h2>
              <div className="mt-4 text-xs text-gray-400">Baseado em {orders.length} pedidos realizados</div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                {isEditing ? <X className="cursor-pointer" onClick={() => setIsEditing(false)}/> : <Edit2 size={18}/>}
                {isEditing ? 'Editar Perfil' : 'Detalhes'}
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Nome" />
                  <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 bg-gray-50 text-sm h-20 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Morada" />
                  <button disabled={isSaving} onClick={handleSaveProfile} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-purple-700 transition flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={16}/> Salvar Alterações</>}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Morada de Entrega</label>
                    <p className="text-sm font-medium text-gray-700">{user?.address || "Nenhuma morada definida"}</p>
                  </div>
                  <button onClick={() => setIsEditing(true)} className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition">
                    Editar Informações
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Histórico de Pedidos */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
              <Package className="text-purple-600" /> Histórico de Compras
            </h3>
            
            <div className="overflow-hidden">
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order._id} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-50 p-3 rounded-xl text-purple-600">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Pedido #{order._id.slice(-6)}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12}/> {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{order.totalPrice.toLocaleString()} AOA</p>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${order.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                  <Package className="mx-auto text-gray-300 mb-4" size={40} />
                  <p className="text-gray-500">Ainda não realizaste compras.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;