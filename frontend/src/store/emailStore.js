import { create } from 'zustand';
import axios from '../lib/axios';

const useEmailStore = create((set) => ({
  singleEmails: [],
  loading: false,
  error: null,

  sendSingleEmail: async (formData) => {
    set({ loading: true });
    try {
      const emailData = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        subject: formData.get('subject'),
        body: formData.get('body')
      };

      const response = await axios.post('/campaigns/send-single', emailData);
      
      // Add the new email to the list
      const newEmail = response.data.data.email;
      set(state => ({
        singleEmails: [newEmail, ...state.singleEmails],
        loading: false
      }));
      
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to send email',
        loading: false 
      });
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send email' 
      };
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