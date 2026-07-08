import React, { useEffect, useState, useRef } from 'react';
import API from '../api/api';
import { User, Package, Clock, ShieldCheck, Mail, MapPin, Camera, Edit2, Save, X, Lock } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    password: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Usa a variável de ambiente, com fallback para localhost em desenvolvimento
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfileAndOrdersData = async () => {
      try {
        const profileResponse = await API.get('/users/profile');
        setUser(profileResponse.data);
        
        setFormData({
          name: profileResponse.data.name || '',
          address: profileResponse.data.address || '',
          password: '' 
        });

        try {
          const ordersResponse = await API.get('/orders/myorders');
          setOrders(ordersResponse.data || []);
        } catch (orderErr) {
          console.warn("Rota de pedidos não encontrada ou falhou.", orderErr);
        }

      } catch (err) {
        console.error("Erro ao carregar dados do perfil", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndOrdersData();
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('address', formData.address);
      if (formData.password) {
        data.append('password', formData.password);
      }
      
      if (fileInputRef.current?.files?.[0]) {
        data.append('image', fileInputRef.current.files[0]);
      }

      const response = await API.put('/users/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUser(response.data);
      setPreviewImage(null);
      setIsEditing(false);
      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil", error);
      alert("Ocorreu um erro ao atualizar o perfil.");
    }
  };

  // Função robusta para obter a URL da imagem
  const getProfileImage = () => {
    if (previewImage) return previewImage; 
    if (!user?.profilePic) return null;
    
    // Se a URL já for externa (ex: Cloudinary), retorna tal como está
    if (user.profilePic.startsWith('http')) return user.profilePic;
    
    // Caso contrário, concatena com a base URL
    return `${BASE_URL}${user.profilePic.startsWith('/') ? '' : '/'}${user.profilePic}`;
  };

  const currentImage = getProfileImage();

  if (loading) return <div className="text-center p-20 text-gray-500 animate-pulse">A carregar os teus dados...</div>;

  const totalGasto = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-mayitec-purple/10 p-4 rounded-full text-mayitec-purple">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user?.name}</h1>
            <p className="text-gray-500 flex items-center gap-2"><Mail size={14}/> {user?.email}</p>
          </div>
        </div>
        
        <div className="bg-gray-900 text-white p-8 rounded-3xl flex flex-col justify-center">
          <p className="text-gray-400 text-sm uppercase tracking-widest">Total Investido</p>
          <h2 className="text-3xl font-bold mt-1">{totalGasto.toLocaleString()} AOA</h2>
          <div className="flex items-center gap-2 text-green-400 mt-2 text-sm">
            <ShieldCheck size={16} /> Membro Verificado
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block group">
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg flex items-center justify-center">
                {currentImage ? (
                  <img src={currentImage} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-mayitec-purple text-white p-2 rounded-full shadow-lg hover:scale-110 transition"
                title="Mudar foto"
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} accept="image/*" />
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-100 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
            >
              {isEditing ? <><X size={16} /> Cancelar</> : <><Edit2 size={16} /> Editar Perfil</>}
            </button>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-800">Detalhes da Conta</h3>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Nome</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full mt-1 border rounded-lg p-2 bg-gray-50 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Morada</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} className="w-full mt-1 border rounded-lg p-2 bg-gray-50 text-sm resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase">Nova Senha</label>
                  <input type="password" name="password" onChange={handleInputChange} placeholder="Deixe em branco p/ manter" className="w-full mt-1 border rounded-lg p-2 bg-gray-50 text-sm" />
                </div>
                <button onClick={handleSaveProfile} className="w-full bg-mayitec-purple text-white py-2 rounded-xl text-sm font-bold hover:opacity-90">Guardar</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold block">Morada</span>
                  <p className="text-sm text-gray-800 font-medium">{user?.address || "Nenhuma definida"}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold block">Segurança</span>
                  <p className="text-sm text-gray-800 font-medium">Senha protegida ********</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Package className="text-mayitec-purple" />
            <h2 className="text-2xl font-bold">O Meu Histórico</h2>
          </div>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Ainda não realizaste compras.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="font-bold">Pedido #{order._id.slice(-6)}</p>
                    <p className="text-xs text-gray-400"><Clock size={12} className="inline"/> {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{order.totalPrice.toLocaleString()} AOA</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${order.status === 'Aprovado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status || 'Pendente'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;