import axios from 'axios';

// Lê a variável de ambiente definida na Vercel ou usa o localhost como fallback
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: baseURL,
});

// Adiciona o token ao cabeçalho automaticamente se ele existir
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    try {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Erro ao ler o token do localStorage", error);
    }
  }
  return config;
});

export default API;