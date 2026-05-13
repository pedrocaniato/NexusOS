import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
});

// Interceptor para injetar o token JWT
api.interceptors.request.use((config) => {
  // Verifica se estamos no lado do cliente antes de acessar localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para tratar expiração de token ou erros de auth
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    if (typeof window !== 'undefined') {
      // Opcional: Redirecionar para login ou limpar storage
      // localStorage.removeItem('access_token');
      // window.location.href = '/login';
    }
  }
  return Promise.reject(error);
});

export default api;
