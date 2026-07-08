import axios from 'axios';

// 1. Obtém a URL base do ambiente
const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 2. Garante que a URL não termina com '/' e adiciona o '/api' de forma segura
// Se o VITE_API_URL já vier com '/api', ele não duplica.
const normalizedBaseURL = base.replace(/\/+$/, ''); // Remove barra no final
const baseURL = normalizedBaseURL.endsWith('/api') ? normalizedBaseURL : `${normalizedBaseURL}/api`;

const API = axios.create({
    baseURL: baseURL,
});

// Interceptor: Injeta o token JWT automaticamente
API.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('userInfo'); 
    
    if (storedUser) {
        try {
            const { token } = JSON.parse(storedUser);
            if (token) {
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

// DEBUG: Log apenas em desenvolvimento para veres o que está a acontecer
if (import.meta.env.MODE === 'development') {
    console.log("API Axios configurada para:", baseURL);
}

export default API;