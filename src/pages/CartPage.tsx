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
  ClipboardList
} from 'lucide-react';
import axios from 'axios';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQty, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  const navigate = useNavigate();
  const API_URL = 'http://localhost:5000';

  const total = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleWhatsAppCheckout = async () => {
    const userInfoString = localStorage.getItem('userInfo');
    
    if (!userInfoString) {
      navigate('/login');
      return;
    }

    const userInfo = JSON.parse(userInfoString);

    try {
      setLoading(true);

      // 1. Preparar o Payload para a API
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

      // 2. Gravar Encomenda no Backend
      const { data } = await axios.post(`${API_URL}/api/orders`, orderPayload, config);
      setCreatedOrderId(data._id);

      // 3. Estruturar uma Mensagem de WhatsApp Super Profissional
      const phoneNumber = "244924002282"; 
      
      const itemsListText = cartItems
        .map(item => `▪️ ${item.name} (x${item.qty}) — ${(item.price * item.qty).toLocaleString()} AOA`)
        .join('\n');

      const whatsappText = `🛍️ *NOVA ENCOMENDA — MAYITEC*\n` +
        `-----------------------------------------\n` +
        `🆔 *Código do Pedido:* #${data._id}\n` +
        `👤 *Cliente:* ${userInfo.name}\n\n` +
        `📦 *Produtos Solicitados:*\n${itemsListText}\n\n` +
        `-----------------------------------------\n` +
        `💰 *Valor Total:* *${total.toLocaleString()} AOA*\n` +
        `💳 *Método de Confirmação:* WhatsApp\n\n` +
        `Olá! Acabei de submeter a minha encomenda no site e aguardo a validação dos dados de faturação.`;

      // Encodar o texto de forma segura para a URL
      const formattedMessage = encodeURIComponent(whatsappText);
      
      // Abre o WhatsApp numa nova aba
      window.open(`https://wa.me/${phoneNumber}?text=${formattedMessage}`, '_blank');

      // 4. Limpar o carrinho local de forma segura
      if (clearCart) {
        clearCart();
      } else {
        cartItems.forEach(item => removeFromCart(item._id));
      }

      // Ativar o ecrã de sucesso na interface
      setIsSuccess(true);

    } catch (error: any) {
      console.error("Erro ao processar checkout:", error);
      alert(error.response?.data?.message || "Ocorreu um erro ao registar a tua encomenda no servidor.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (item: any) => {
    const path = item.imageUrl || item.image || '';
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  // --- RECONHECIMENTO VISUAL: ECRÃ DE SUCESSO PREMIUM ---
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-gray-100 rounded-3xl shadow-xl text-center flex flex-col items-center justify-center animate-fade-in">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm border border-green-100">
          <CheckCircle2 size={44} className="animate-bounce" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-2">Encomenda Registada!</h2>
        <p className="text-gray-500 mb-6 text-sm max-w-sm">
          O teu pedido foi guardado no sistema com o estado <span className="font-semibold text-yellow-600">Pendente</span> e o teu carrinho foi esvaziado com sucesso.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 w-full mb-8 text-left border border-gray-100">
          <div className="flex justify-between items-center mb-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
            <span>Detalhes do Registo</span>
          </div>
          <p className="text-sm text-gray-700 font-mono mb-1">
            <span className="font-semibold text-gray-900">ID:</span> #{createdOrderId}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Canal:</span> Redirecionado para o WhatsApp de Suporte
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <button 
            onClick={() => navigate('/profile')}
            className="w-full bg-mayitec-purple text-white py-3.5 px-4 rounded-xl font-bold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <ClipboardList size={18} /> Ver Meu Histórico
          </button>
          <Link 
            to="/" 
            className="w-full bg-gray-100 text-gray-700 py-3.5 px-4 rounded-xl font-bold text-sm hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            Continuar a Comprar
          </Link>
        </div>
        
        <p className="text-xs text-gray-400 mt-6 flex items-center gap-1">
          Não abriu o chat? <a href={`https://wa.me/244924002282?text=${encodeURIComponent("Olá, verifique a minha encomenda #" + createdOrderId)}`} target="_blank" rel="noreferrer" className="text-green-600 underline font-semibold flex items-center gap-0.5">Clica aqui para reenviar <ExternalLink size={10} /></a>
        </p>
      </div>
    );
  }

  // --- ECRÃ DE CARRINHO VAZIO ---
  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center min-h-[65vh] text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <ShoppingBag size={40} className="text-gray-300" />
        </div>
        <h2 className="text-3xl font-black text-mayitec-dark mb-2">O teu carrinho está vazio</h2>
        <p className="text-gray-500 mb-8 max-w-sm">Parece que ainda não adicionaste nenhum produto tecnológico à tua seleção.</p>
        <Link to="/" className="bg-mayitec-purple text-white px-10 py-4 rounded-full font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all">
          Explorar Catálogo
        </Link>
      </div>
    );
  }

  // --- CORPO DO CARRINHO (DESIGN MELHORADO & ELEGANTE) ---
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">O teu Carrinho</h1>
          <p className="text-gray-500 text-sm mt-1">Tens {cartItems.length} {cartItems.length === 1 ? 'item selecionado' : 'itens selecionados'}.</p>
        </div>
        <Link to="/" className="text-mayitec-purple font-bold text-sm hover:underline flex items-center gap-1">
          ← Voltar para a loja
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-12 items-start">
        {/* Listagem de Itens */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div 
              key={item._id} 
              className="flex flex-col sm:flex-row gap-4 p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 items-center"
            >
              <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-50">
                <img 
                  src={getImageUrl(item)} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition hover:scale-105 duration-300"
                  onError={(e) => e.currentTarget.src = "https://via.placeholder.com/150?text=Sem+Imagem"}
                />
              </div>
              
              <div className="flex-grow text-center sm:text-left">
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{item.name}</h3>
                <p className="text-mayitec-purple font-black text-xl mt-0.5">{item.price.toLocaleString()} AOA</p>
                
                {/* Controlo de Quantidade Refinado */}
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                  <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl p-1 shadow-inner">
                    <button 
                      onClick={() => updateQty(item._id, item.qty - 1)} 
                      disabled={item.qty <= 1}
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white transition"
                    >
                      <Minus size={14}/>
                    </button>
                    <span className="font-extrabold text-sm px-4 text-gray-800 min-w-[24px] text-center">{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item._id, item.qty + 1)} 
                      className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition"
                    >
                      <Plus size={14}/>
                    </button>
                  </div>
                  
                  <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                    Subtotal: {(item.price * item.qty).toLocaleString()} AOA
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => removeFromCart(item._id)} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition self-end sm:self-center"
                title="Remover produto"
              >
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
        </div>

        {/* Resumo e Checkout Card */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100/80 lg:sticky lg:top-24">
          <h3 className="text-2xl font-black text-gray-900 mb-6">Resumo da Compra</h3>
          
          <div className="space-y-4 mb-6 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal dos produtos</span>
              <span className="font-semibold text-gray-800">{total.toLocaleString()} AOA</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Taxa de Processamento</span>
              <span className="text-green-600 font-bold uppercase text-xs tracking-wider bg-green-50 px-2 py-0.5 rounded">Grátis</span>
            </div>
            
            <div className="flex justify-between font-black text-2xl text-gray-900 border-t border-dashed pt-4 mt-2">
              <span>Total</span>
              <span className="text-mayitec-purple">{total.toLocaleString()} AOA</span>
            </div>
          </div>
          
          <button 
            onClick={handleWhatsAppCheckout}
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                A processar...
              </span>
            ) : (
              <>
                Finalizar via WhatsApp <ArrowRight size={20} />
              </>
            )}
          </button>
          
          {!localStorage.getItem('userInfo') ? (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold">Atenção:</span> Precisas de iniciar sessão para registar esta encomenda na tua conta.
              </div>
            </div>
          ) : (
            <p className="text-center text-[11px] text-gray-400 mt-4 leading-relaxed">
              Ao clicar, os dados serão salvos de forma segura e o suporte técnico da Mayitec abrirá para validação imediata do pagamento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;