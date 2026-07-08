import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useCart } from './context/CartContext'; 
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminProductPage from './pages/AdminProductPage';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProfilePage from './pages/ProfilePage';
import { LogOut, ShoppingBag, User, MapPin, Mail, Phone } from 'lucide-react';

// Componente de Loading
const LoadingScreen: React.FC = () => (
  <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white">
    <img 
      src="/logo.png" 
      alt="MAYITEC Logo" 
      className="h-42 w-auto object-contain animate-pulse mb-6" 
    />
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-t-mayitec-purple border-gray-200 rounded-full animate-spin"></div>
      <p className="mt-6 text-gray-400 font-medium tracking-[0.2em] uppercase text-xs">
        A preparar a sua experiência...
      </p>
    </div>
  </div>
);

// Proteção para Admin corrigida para evitar o erro de Namespace JSX
interface AdminRouteProps {
  children: React.ReactElement;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const userInfoString = localStorage.getItem('userInfo');
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  return userInfo && userInfo.isAdmin ? children : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const isLoggedIn = !!localStorage.getItem('userInfo');

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-mayitec-gradient p-4 shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="hover:opacity-80 transition">
              <img src="/logo.png" alt="MAYITEC" className="h-20 w-auto object-contain brightness-0 invert" />
            </Link>
            
            <div className="flex gap-4 items-center">
              {isLoggedIn ? (
                <>
                  <Link to="/profile" className="text-white flex items-center gap-2 hover:underline">
                    <User size={18} /> Perfil
                  </Link>
                  <button onClick={handleLogout} className="text-white bg-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500 transition flex items-center gap-2 text-sm">
                    <LogOut size={16} /> Sair
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-white font-medium hover:underline flex items-center gap-2">
                  <User size={18} /> Login
                </Link>
              )}
              
              <Link to="/cart" className="bg-white text-mayitec-purple font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition shadow flex items-center gap-2">
                <ShoppingBag size={18} /> Carrinho 
                {totalItems > 0 && <span className="bg-mayitec-purple text-white text-xs px-2 py-1 rounded-full animate-bounce">{totalItems}</span>}
              </Link>
            </div>
          </div>
        </nav>

        {/* Área dinâmica */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/add-product" element={<AdminRoute><AdminProductPage /></AdminRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 px-6 border-t-4 border-mayitec-purple">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Coluna 1: Sobre */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white text-2xl font-bold mb-4">MAYITEC</h3>
              <p className="text-sm leading-relaxed max-w-sm">
                Soluções tecnológicas avançadas para o mercado Angolano. 
                Comprometidos com a inovação, eficiência e o sucesso digital da sua empresa.
              </p>
            </div>

            {/* Coluna 2: Links */}
            <div>
              <h3 className="text-white font-bold mb-4">Navegação</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-mayitec-purple transition">Catálogo</Link></li>
                <li><Link to="/cart" className="hover:text-mayitec-purple transition">Carrinho</Link></li>
                <li><Link to="/profile" className="hover:text-mayitec-purple transition">Minha Conta</Link></li>
              </ul>
            </div>

            {/* Coluna 3: Contactos */}
            <div>
              <h3 className="text-white font-bold mb-4">Contactos</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><MapPin size={16} /> Luanda, Angola</li>
                <li className="flex items-center gap-2"><Mail size={16} /> mayitec.services@gmail.com</li>
                <li className="flex items-center gap-2"><Phone size={16} /> +244 924 002 282</li>
              </ul>
            </div>
          </div>

          {/* Barra Inferior */}
          <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} EDME SOLUTIONS. Todos os direitos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-white cursor-pointer">Termos de Serviço</span>
              <span className="hover:text-white cursor-pointer">Privacidade</span>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;