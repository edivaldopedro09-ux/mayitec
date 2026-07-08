import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Minus, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  ClipboardList,
  Package
} from 'lucide-react';
import axios from 'axios';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQty, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  // Fallback seguro para imagens que falham
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://placehold.co/150x150/e5e7eb/9ca3af?text=Sem+Foto';
  };

  const handleWhatsAppCheckout = async () => {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
      navigate('/login');
      return;
    }

    const userInfo = JSON.parse(userInfoString);

    try {
      setLoading(true);
      const orderPayload = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image || item.imageUrl || '',
          price: item.price,
          product: item._id
        })),
        totalPrice: total,
        paymentMethod: 'WhatsApp'
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`
        }
      };

      const { data } = await axios.post(`${API_URL}/api/orders`, orderPayload, config);
      setCreatedOrderId(data._id);

      const phoneNumber = "244924002282"; 
      const itemsListText = cartItems
        .map(item => `▪️ ${item.name} (x${item.qty}) — ${(item.price * item.qty).toLocaleString()} AOA`)
        .join('\n');

      const whatsappText = `🛍️ *NOVA ENCOMENDA — MAYITEC*\n` +
        `-----------------------------------------\n` +
        `🆔 *Código do Pedido:* #${data._id}\n` +
        `👤 *Cliente:* ${userInfo.name}\n\n` +
        `📦 *Produtos:*\n${itemsListText}\n\n` +
        `💰 *Total:* *${total.toLocaleString()} AOA*\n\n` +
        `Olá! Acabei de submeter o pedido ${data._id} e aguardo a validação.`;

      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappText)}`, '_blank');

      if (clearCart) clearCart();
      setIsSuccess(true);

    } catch (error: any) {
      console.error("Erro no checkout:", error);
      alert("Erro ao processar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item: any) => {
    const path = item.imageUrl || item.image || '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  // --- ECRÃ DE SUCESSO ---
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-gray-100 rounded-3xl shadow-xl text-center flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
          <CheckCircle2 size={44} />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Pedido Registado!</h2>
        <p className="text-gray-500 mb-8 text-sm">O teu pedido foi guardado com sucesso.</p>

        <div className="bg-gray-50 rounded-2xl p-4 w-full mb-8 text-left border border-gray-100">
          <p className="text-sm text-gray-700 font-mono"><span className="font-bold">ID:</span> #{createdOrderId}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <button onClick={() => navigate('/profile')} className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition">Ver Histórico</button>
          <Link to="/" className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition">Comprar Mais</Link>
        </div>
      </div>
    );
  }

  // --- ECRÃ VAZIO ---
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Carrinho Vazio</h2>
        <p className="text-gray-500 mb-8">Ainda não adicionaste produtos.</p>
        <Link to="/" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition">Ver Loja</Link>
      </div>
    );
  }

  // --- ECRÃ PRINCIPAL ---
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Carrinho</h1>
        <p className="text-gray-500">{cartItems.length} itens na tua lista</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lista */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item._id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-3xl shadow-sm items-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 border border-gray-50">
                <img 
                  src={getImageUrl(item)} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-purple-600 font-bold">{item.price.toLocaleString()} AOA</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQty(item._id, item.qty - 1)} className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"><Minus size={14}/></button>
                  <span className="font-bold text-sm w-8 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item._id, item.qty + 1)} className="p-1 rounded-lg bg-gray-100 hover:bg-gray-200"><Plus size={14}/></button>
                </div>
              </div>
              
              <button onClick={() => removeFromCart(item._id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={20}/></button>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 h-fit lg:sticky lg:top-8">
          <h3 className="text-xl font-black mb-6">Resumo</h3>
          <div className="space-y-3 mb-6 text-sm">
            <div className="flex justify-between"><span>Subtotal</span> <span className="font-bold">{total.toLocaleString()} AOA</span></div>
            <div className="flex justify-between text-gray-500"><span>Taxa</span> <span className="font-bold">Grátis</span></div>
            <div className="border-t pt-4 flex justify-between font-bold text-lg"><span>Total</span> <span className="text-purple-600">{total.toLocaleString()} AOA</span></div>
          </div>
          
          <button 
            onClick={handleWhatsAppCheckout}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            {loading ? "Processando..." : <>Finalizar no WhatsApp <ArrowRight size={18}/></>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;