import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/api';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Check, ShieldCheck, Truck, RefreshCw, AlertCircle } from 'lucide-react';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // A base URL deve ser a do teu backend no Render, ex: https://teu-backend.onrender.com
  // Certifica-te que esta variável está na Vercel (Settings > Environment Variables)
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://mayitec-backend.onrender.com';

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (err: any) {
        console.error("Erro ao carregar produto:", err);
        setError("Não foi possível carregar este produto.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Função para limpar a URL e remover o localhost
  const getSafeImageUrl = (url: string) => {
    if (!url) return "/sem-foto.png";
    
    // Se a URL contém 'localhost', removemos o domínio e forçamos o uso da API Base
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
       // Extrai apenas o caminho (ex: /uploads/123.jpg)
       const path = url.replace(/https?:\/\/[^/]+/, ''); 
       return `${apiBaseUrl}${path}`;
    }
    
    // Se já for uma URL externa (http), retorna tal qual
    if (url.startsWith('http')) return url;
    
    // Caso contrário, concatena
    return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  if (loading) return <div className="p-12 text-center">Carregando...</div>;

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-red-100 rounded-3xl text-center">
        <h2 className="text-2xl font-black mb-2">Ops!</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="bg-purple-600 text-white px-6 py-2 rounded-xl">Voltar</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button onClick={() => navigate(-1)} className="mb-8 font-bold text-sm">← Voltar</button>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white p-4 rounded-3xl shadow-md">
          <img 
            src={getSafeImageUrl(product?.imageUrl)} 
            alt={product?.name}
            className="w-full h-[400px] object-cover rounded-2xl"
            onError={(e) => {
              // Isto mata o loop de erro e carrega a imagem local
              e.currentTarget.onerror = null; 
              e.currentTarget.src = "/sem-foto.png";
            }}
          />
        </div>

        <div>
          <h1 className="text-4xl font-black mb-4">{product?.name}</h1>
          <p className="text-2xl font-black text-purple-600 mb-6">{product?.price?.toLocaleString()} AOA</p>
          <p className="text-gray-600 mb-6">{product?.description}</p>
          
          <button 
            onClick={handleAddToCart}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold"
          >
            {isAdded ? "Adicionado!" : "Adicionar ao Carrinho"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;