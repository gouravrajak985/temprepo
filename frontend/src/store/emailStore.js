import { create } from 'zustand';
import axios from '../lib/axios';

const useEmailStore = create((set) => ({
  singleEmails: [],
  loading: false,
  error: null,

  sendSingleEmail: async (emailData) => {
    set({ loading: true });
    try {
      const response = await axios.post('/campaigns/send-single', emailData);
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send email',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message };
    }
  },

  fetchSingleEmails: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/campaigns/single-emails');
      set({ 
        singleEmails: response.data.data.emails,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch emails',
        loading: false 
      });
    }
  }
}));

export default useEmailStore;