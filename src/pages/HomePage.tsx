import React, { useEffect, useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import API from '../api/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [sortBy, setSortBy] = useState('nenhum');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const itemsPerPage = 8;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await API.get('/products');
        setProducts(data);
        const savedFavs = JSON.parse(localStorage.getItem('favs') || '[]');
        setFavorites(savedFavs);
      } catch (err) { 
        console.error("Erro ao carregar produtos:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchProducts();
  }, []);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favs', JSON.stringify(newFavs));
  };

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (selectedCategory === 'Todos' || p.category === selectedCategory)
    );
    
    if (sortBy === 'preco-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'preco-desc') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [searchTerm, selectedCategory, products, sortBy]);

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Função para resolver a URL da imagem de forma segura
  const resolveImageUrl = (url: string) => {
    if (!url) return '/sem-foto.png';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url.startsWith('/') ? url : '/' + url}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner de Destaque */}
      <div className="bg-mayitec-gradient rounded-3xl p-10 mb-10 text-white shadow-2xl">
        <h1 className="text-5xl font-bold mb-2">MAYITEC PREMIUM</h1>
        <p className="text-xl opacity-90">A tecnologia que define o seu futuro. Aproveite os descontos da semana!</p>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Pesquisar acessórios..." 
          className="flex-grow p-3 border rounded-xl outline-none focus:ring-2 focus:ring-mayitec-purple" 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <select className="p-3 border rounded-xl outline-none" onChange={(e) => setSortBy(e.target.value)}>
          <option value="nenhum">Ordenar por...</option>
          <option value="preco-asc">Preço: Menor ao Maior</option>
          <option value="preco-desc">Preço: Maior ao Menor</option>
        </select>
      </div>

      {/* Categorias */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }} 
            className={`px-5 py-2 rounded-full whitespace-nowrap transition ${selectedCategory === cat ? 'bg-mayitec-purple text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">A carregar montra...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {paginatedProducts.map((product) => (
            <div key={product._id} className="relative">
              <ProductCard 
                id={product._id} 
                name={product.name} 
                price={product.price} 
                category={product.category}
                imageUrl={resolveImageUrl(product.imageUrl)}
              />
              <button 
                onClick={() => toggleFavorite(product._id)} 
                className="absolute top-2 right-2 text-2xl z-10 transition-transform hover:scale-110"
              >
                {favorites.includes(product._id) ? '❤️' : '🤍'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentPage(i + 1)} 
              className={`px-4 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-mayitec-purple text-white' : 'bg-gray-200'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;