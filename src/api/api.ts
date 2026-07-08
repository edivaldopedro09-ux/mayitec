import axios from 'axios';

// Configuração dinâmica: Usa a variável da Vercel em produção, ou localhost em desenvolvimento
const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor: Injeta o token JWT automaticamente em todos os pedidos
API.interceptors.request.use((config) => {
    // Busca os dados do utilizador guardados no Login
    const storedUser = localStorage.getItem('userInfo'); 
    
    if (storedUser) {
        try {
            const { token } = JSON.parse(storedUser);
            if (token) {
                // Adiciona o token ao cabeçalho Authorization
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Erro ao ler o token do localStorage:", error);
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;