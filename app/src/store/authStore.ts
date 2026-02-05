import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  language: string;
  avatar?: string;
  isPro: boolean;
  proExpiresAt?: string;
  streak: number;
  lastActive?: string;
  xp: number;
  level: number;
  institution?: string;
  department?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      
      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      }),
      
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'codesahayak-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API helper functions
export const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = useAuthStore.getState().token;
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  },

  // Auth endpoints
  signup: (data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    language: string;
    institution?: string;
    department?: string;
  }) => api.request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (email: string, password: string) =>
    api.request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: () => api.request('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Payment endpoints
  createOrder: (plan: 'STUDENT_PRO_MONTHLY' | 'STUDENT_PRO_YEARLY') =>
    api.request('/payment/create-order', { method: 'POST', body: JSON.stringify({ plan }) }),

  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.request('/payment/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Progress endpoints
  trackProgress: (data: {
    concept: string;
    language: string;
    isCorrect: boolean;
    hintsUsed?: number;
  }) => api.request('/progress/track', { method: 'POST', body: JSON.stringify(data) }),

  getProgressStats: () => api.request('/progress/stats'),

  // AI endpoints
  getExplanation: (data: {
    code: string;
    error?: string;
    language: string;
    userLanguage: string;
    concept?: string;
  }) => api.request('/ai/explain', { method: 'POST', body: JSON.stringify(data) }),

  getHint: (data: {
    code: string;
    error?: string;
    attempt: number;
    userLanguage: string;
  }) => api.request('/ai/hint', { method: 'POST', body: JSON.stringify(data) }),

  getDebugHelp: (data: {
    code: string;
    error: string;
    language: string;
    userLanguage: string;
    step: number;
  }) => api.request('/ai/debug', { method: 'POST', body: JSON.stringify(data) }),
};
