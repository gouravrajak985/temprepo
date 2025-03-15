import { create } from 'zustand';
import axios from '../lib/axios';

const useCampaignStore = create((set, get) => ({
  campaigns: [],
  currentCampaign: null,
  loading: false,
  error: null,

  fetchCampaigns: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/campaigns');
      set({ campaigns: response.data.data.campaigns, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch campaigns',
        loading: false 
      });
    }
  },

  createCampaign: async (formData) => {
    try {
      const response = await axios.post('/campaigns', formData);
      set(state => ({
        campaigns: [...state.campaigns, response.data.data.campaign]
      }));
      return { success: true, campaign: response.data.data.campaign };
    } catch (error) {
      console.error('Campaign creation error:', error.response?.data || error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create campaign'
      };
    }
  },

  fetchCampaign: async (id) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/campaigns/${id}`);
      set({ currentCampaign: response.data.data.campaign, loading: false });
      return response.data.data.campaign;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch campaign',
        loading: false 
      });
      return null;
    }
  },

  updateCampaign: async (id, updates) => {
    try {
      const response = await axios.patch(`/campaigns/${id}`, updates);
      set(state => ({
        campaigns: state.campaigns.map(c => 
          c._id === id ? response.data.data.campaign : c
        ),
        currentCampaign: response.data.data.campaign
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update campaign'
      };
    }
  },

  deleteCampaign: async (id) => {
    try {
      await axios.delete(`/campaigns/${id}`);
      set(state => ({
        campaigns: state.campaigns.filter(c => c._id !== id)
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete campaign' 
      };
    }
  },

  sendCampaign: async (id) => {
    try {
      await axios.post(`/campaigns/${id}/send`);
      set(state => ({
        campaigns: state.campaigns.map(c =>
          c._id === id ? { ...c, status: 'sending' } : c
        ),
        currentCampaign: state.currentCampaign && state.currentCampaign._id === id
          ? { ...state.currentCampaign, status: 'sending' }
          : state.currentCampaign
      }));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send campaign' 
      };
    }
  }
}));

export default useCampaignStore;  