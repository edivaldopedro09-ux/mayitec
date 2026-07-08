import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { useCart } from '../context/CartContext';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Usa a variável de ambiente definida na Vercel
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://api.mayitec.com';

  useEffect(() => {
    if (!id) {
      setError("ID do produto inválido.");
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err: any) {
        console.error("Erro ao carregar produto:", err);
        setError("Não foi possível localizar este produto no catálogo.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  /**
   * Função Inteligente para corrigir o caminho da imagem
   * Se vier com localhost, ele substitui pelo domínio correto de produção
   */
  const getImageUrl = (url: string) => {
    if (!url) return "https://placehold.co/600?text=Sem+Imagem";
    
    // Se a imagem guardada no BD tiver 'localhost:5000', substituímos
    if (url.includes('localhost:5000')) {
      const pathOnly = url.split('localhost:5000')[1]; // Pega apenas "/uploads/..."
      return `${apiBaseUrl}${pathOnly}`;
    }
    
    // Se for uma URL externa, retorna como está
    if (url.startsWith('http')) return url;
    
    // Se for caminho relativo, anexa a base
    return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center animate-pulse space-y-4">
        <div className="h-8 w-32 bg-gray-200 rounded-lg"></div>
        <div className="grid md:grid-cols-2 gap-12 mt-6">
          <div className="bg-gray-200 h-[450px] rounded-3xl"></div>
          <div className="space-y-6 py-6">
            <div className="h-10 bg-gray-200 rounded-xl w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
            <div className="h-24 bg-gray-200 rounded-2xl"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-red-100 rounded-3xl shadow-xl text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Ops! Algo correu mal</h2>
        <p className="text-gray-500 mb-6 text-sm">{error}</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-mayitec-purple text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:opacity-95 transition"
        >
          Voltar para a Montra
        </button>
      </div>
    );
  }

  const isOutOfStock = product?.stock <= 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fade-in">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-mayitec-purple font-bold text-sm mb-8 transition group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar atrás
      </button>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="bg-white p-4 border border-gray-100 rounded-3xl shadow-md overflow-hidden group">
          <div className="w-full h-[350px] md:h-[480px] rounded-2xl overflow-hidden bg-gray-50">
            <img 
              src={getImageUrl(product.imageUrl)} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              // Fallback para caso a imagem realmente não carregue
              onError={(e) => e.currentTarget.src = "https://placehold.co/600?text=Sem+Imagem"}
            />
          </div>
        </div>

        <div className="flex flex-col h-full justify-between py-2">
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border border-gray-200/40">
                {product.category || 'Geral'}
              </span>
              
              {isOutOfStock ? (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-xs font-bold border border-red-100">
                  Esgotado temporariamente
                </span>
              ) : (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-xl text-xs font-bold border border-green-100">
                  Em Stock ({product.stock} disponíveis)
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <span className="text-3xl font-black text-mayitec-purple tracking-tight">
                {product.price?.toLocaleString()}
              </span>
              <span className="text-lg font-black text-mayitec-purple ml-1">AOA</span>
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Descrição Completa</h3>
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
                {product.description || "Nenhuma descrição detalhada fornecida para este equipamento."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4.5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-md transition-all duration-300 transform active:scale-98 ${
                isOutOfStock 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : isAdded 
                    ? 'bg-green-600 text-white shadow-green-100' 
                    : 'bg-mayitec-purple text-white hover:opacity-95 hover:shadow-lg'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={22} className="animate-scale-up" /> Adicionado com sucesso!
                </>
              ) : isOutOfStock ? (
                "Indisponível"
              ) : (
                <>
                  <ShoppingCart size={22} /> Adicionar ao Carrinho
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50 text-[11px] text-gray-400 text-center font-medium">
              <div className="flex flex-col items-center gap-1 p-2 bg-gray-50/60 rounded-xl">
                <ShieldCheck size={18} className="text-mayitec-purple" />
                <span>Garantia Mayitec</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-gray-50/60 rounded-xl">
                <Truck size={18} className="text-mayitec-purple" />
                <span>Entrega Segura</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-gray-50/60 rounded-xl">
                <RefreshCw size={18} className="text-mayitec-purple" />
                <span>Suporte Completo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;