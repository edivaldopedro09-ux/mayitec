import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Este interceptor vai intercetar todos os pedidos e injetar o token
API.interceptors.request.use((config) => {
    // CORREÇÃO: Usamos 'userInfo' para coincidir com o localStorage.setItem('userInfo') do Login
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