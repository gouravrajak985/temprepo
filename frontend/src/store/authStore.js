import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../lib/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email, password) => {
        try {
          const response = await axios.post('/auth/login', { email, password });
          const { token, data: { user } } = response.data;
          
          set({ user, token, isAuthenticated: true });
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
          const response = await axios.post('/auth/signup', userData);
          const { token, data: { user } } = response.data;
          
          set({ user, token, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;