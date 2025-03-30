// utils/api.js
import axios from 'axios';
import { API_BASE_URL } from '@env';

const baseURL = `${API_BASE_URL}`;

const api = axios.create({
  baseURL,
  timeout: 10000, // 10 sekund timeout
});


api.interceptors.request.use(config => {
  console.log('Wysyłanie żądania:', config.method, config.url);
  return config;
}, error => {
  console.error('Błąd żądania:', error);
  return Promise.reject(error);
});

// Interceptor do obsługi błędów
api.interceptors.response.use(response => response, error => {
  if (error.response) {
    console.error('Błąd odpowiedzi:', error.response.status, error.response.data);
  } else if (error.request) {
    console.error('Brak odpowiedzi z serwera');
  } else {
    console.error('Błąd podczas konfiguracji żądania:', error.message);
  }
  return Promise.reject(error);
});

export default api;