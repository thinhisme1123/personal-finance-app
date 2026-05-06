import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your machine's local IP if testing on a physical device
// e.g., http://192.168.1.100:3000
// For Android emulator use: http://10.0.2.2:3000
const BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token automatically to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Auth ---
export const register = (email: string, password: string) =>
  api.post('/auth/register', { email, password });

export const login = (email: string, password: string) =>
  api.post<{ access_token: string }>('/auth/login', { email, password });

// --- Transactions ---
export const getTransactions = () => api.get('/transactions');

export const createTransaction = (data: {
  amount: number;
  type: string;
  category: string;
  date?: string;
  note?: string;
}) => api.post('/transactions', data);
