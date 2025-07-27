import { create } from 'zustand';
import api from '../services/api.js';
import jwtDecode from 'jwt-decode'; // ← FIXED: Changed to named import

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  initialize: async () => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const decoded = jwtDecode(token); // Usage remains the same
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error('Token expired');
        }

        // Validate with backend
        const response = await api.get('/auth/profile');
        set({ 
          user: response.data.user, 
          isAuthenticated: true, 
          loading: false 
        });
      } catch (error) {
        get().logout();
      }
    } else {
      set({ loading: false });
    }
  },

  // ... rest of your code remains the same
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true 
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ 
        user, 
        isAuthenticated: true 
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ 
      user: null, 
      isAuthenticated: false 
    });
  }
}));
