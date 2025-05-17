import { create } from 'zustand';
import { UserStatsState, UserStatsActions } from './types';
import { axiosInstance } from '@/lib/axios';

export const useUserStatsStore = create<UserStatsState & UserStatsActions>((set) => ({
  stats: [],
  loading: false,
  selectedDate: new Date(),

  fetchStats: async (date: Date) => {
    set({ loading: true });
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await axiosInstance.get(`/admin/stats?date=${formattedDate}`);
      
      if (response.data.success) {
        set({ stats: response.data.data || [] });
      } else {
        set({ stats: [] });
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      set({ stats: [] });
    } finally {
      set({ loading: false });
    }
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date });
  }
}));