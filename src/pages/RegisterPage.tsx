import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/api';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Ativa o estado de carregamento
    try {
      await API.post('/users/register', { name, email, password });
      alert('Conta criada com sucesso! Pode agora iniciar sessão.');
      navigate('/login');
    } catch (error: any) {
      // Exibe uma mensagem mais clara caso o email já exista ou erro no servidor
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
      alert(errorMessage);
    } finally {
      setLoading(false); // Desativa o carregamento
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-mayitec-dark mb-2">Criar Conta</h2>
          <p className="text-gray-500">Junte-se ao ecossistema MAYITEC</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label>
            <input 
              type="text" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-mayitec-purple outline-none transition-all"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 focus:ring-2 focus:ring-mayitec-purple outline-none transition-all"
              placeholder="seu-email@exemplo.ao"
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
            {loading ? 'A processar...' : 'Criar Conta'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Já tem uma conta? <Link to="/login" className="text-mayitec-purple font-bold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;