import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../lib/axios';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingVerification: false,
      
      login: async (email, password) => {
        try {
          const response = await axios.post('/auth/login', { email, password });
          const { token, requiresVerification, data: { user } } = response.data;
          
          if (requiresVerification) {
            set({ user, pendingVerification: true });
            return { success: true, requiresVerification: true };
          }

          set({ user, token, isAuthenticated: true, pendingVerification: false });
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
          
          set({ user, pendingVerification: true });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      verifyOTP: async (email, otp) => {
        try {
          const response = await axios.post('/auth/verify-otp', { email, otp });
          const { token, data: { user } } = response.data;
          
          set({ user, token, isAuthenticated: true, pendingVerification: false });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || 'OTP verification failed'
          };
        }
      },

      resendOTP: async (email) => {
        try {
          await axios.post('/auth/resend-otp', { email });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || 'Failed to resend OTP'
          };
        }
      },

      loginWithOTP: async (email) => {
        try {
          await axios.post('/auth/login-with-otp', { email });
          set({ user: { email }, pendingVerification: true });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || 'Failed to send OTP'
          };
        }
      },

      verifyLoginOTP: async (email, otp) => {
        try {
          const response = await axios.post('/auth/verify-login-otp', { email, otp });
          const { token, data: { user } } = response.data;
          
          set({ user, token, isAuthenticated: true, pendingVerification: false });
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error.response?.data?.message || 'OTP verification failed'
          };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, pendingVerification: false });
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);

export default useAuthStore;