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

  createCampaign: async (campaignData) => {
    set({ loading: true });
    try {
      const response = await axios.post('/campaigns', campaignData);
      set(state => ({
        campaigns: [...state.campaigns, response.data.data.campaign],
        loading: false
      }));
      return { success: true, campaign: response.data.data.campaign };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create campaign',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message };
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
    set({ loading: true });
    try {
      const response = await axios.patch(`/campaigns/${id}`, updates);
      set(state => ({
        campaigns: state.campaigns.map(c => 
          c._id === id ? response.data.data.campaign : c
        ),
        currentCampaign: response.data.data.campaign,
        loading: false
      }));
      return { success: true };
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update campaign',
        loading: false 
      });
      return { success: false, error: error.response?.data?.message };
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
        )
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