import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, imageUrl, category }) => {
  
  // Agora que a URL chega resolvida da HomePage/Backend,
  // esta função serve apenas como uma camada de segurança extra.
  const displayImageUrl = imageUrl || "https://placehold.co/300x300?text=Sem+Imagem";

  return (
    <div className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200/60 transition-all duration-300 flex flex-col overflow-hidden h-full">
      
      {/* Container da Imagem */}
      <div className="relative w-full h-52 bg-gray-50 overflow-hidden flex-shrink-0">
        {category && (
          <span className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-md text-gray-600 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-sm border border-gray-100/50 uppercase tracking-wider">
            {category}
          </span>
        )}
        <img 
          src={displayImageUrl}
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = "https://placehold.co/300x300?text=Erro+Imagem";
          }}
        />
      </div>

      {/* Corpo de Informações do Produto */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base md:text-lg line-clamp-2 leading-snug group-hover:text-mayitec-purple transition-colors duration-200">
            {name}
          </h3>
          
          <p className="text-mayitec-purple font-black text-xl tracking-tight mt-2">
            {price?.toLocaleString()} <span className="text-sm font-bold">AOA</span>
          </p>
        </div>

        {/* Botão de Ação */}
        <Link 
          to={`/product/${id}`} 
          className="mt-5 w-full bg-gray-50 text-gray-700 group-hover:bg-mayitec-purple group-hover:text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 border border-gray-100 group-hover:border-transparent shadow-sm"
        >
          <Eye size={16} />
          <span>Ver Detalhes</span>
          <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;