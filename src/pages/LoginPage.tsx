import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/users/login', { email, password });
      
      // Guardar os dados (token + info do user)
      localStorage.setItem('userInfo', JSON.stringify(data));
      
      // Lógica de Redirecionamento Baseada no Perfil
      if (data.isAdmin) {
        navigate('/admin'); // Redireciona para o Painel Administrativo
      } else {
        navigate('/');      // Redireciona para a Home da Loja
      }
      
      // Força um pequeno refresh no estado do sistema (opcional)
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      alert("Email ou password inválidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-mayitec-dark mb-2">Entrar na MAYITEC</h2>
          <p className="text-gray-500">Gestão e acesso exclusivo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-mayitec-purple outline-none transition-all"
              placeholder="admin@mayitec.ao"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-mayitec-purple outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-mayitec-gradient text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-mayitec-purple/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'A processar...' : 'Aceder ao Painel'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Não tem conta? <Link to="/register" className="text-mayitec-purple font-bold hover:underline">Registe-se</Link>
        </p>
      </div>
    </div>
  );
};


export default LoginPage;