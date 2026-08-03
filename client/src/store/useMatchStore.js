import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
export const useMatchStore = create((set) => ({
  matches: [],
  isLoadingMyMatches: false,
  isLoadingUserProfiles: false,
  userProfiles: [],
  swipeFeedback: null,

  getMyMatches: async () => {
    try {
      set({ isLoadingMyMatches: true });
      const response = await axiosInstance.get('/matches');
      set({ matches: response.data.matches, isLoadingMyMatches: false });
    } catch (error) {
      console.error('Get My Matches Error:', error);
      set({ isLoadingMyMatches: false });
      const errorMessage =
        error.response?.data?.message || 'Failed to get matches';
      toast.error(errorMessage);
    }
  },
  getUserProfiles: async () => {
    try {
      set({ isLoadingUserProfiles: true });
      const response = await axiosInstance.get('/matches/user-profiles');
      set({
        userProfiles: response.data.users,
        isLoadingUserProfiles: false,
      });
      console.log(response.data.users);
    } catch (error) {
      console.error('Get User Profiles Error:', error);
      set({ isLoadingUserProfiles: false, matches: [] });
      const errorMessage =
        error.response?.data?.message || 'Failed to get user profiles';
      toast.error(errorMessage);
    }
  },
  subscribeToNewMatches: async () => {},

  unsubscribeFromNewMatches: async () => {},
  swipeLeft: async (user) => {
    try {
      set({ swipeFeedback: 'passed' });
      await axiosInstance.post('/matches/swipe-left/' + user._id);
    } catch (error) {
      console.error('Swipe Left Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to swipe left';
      set({ swipeFeedback: null });
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        set({ swipeFeedback: null });
      }, 1500);
    }
  },
  swipeRight: async (user) => {
    try {
      set({ swipeFeedback: 'liked' });
      await axiosInstance.post('/matches/swipe-right/' + user._id);
    } catch (error) {
      console.error('Swipe Right Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to swipe right';
      set({ swipeFeedback: null });
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        set({ swipeFeedback: null });
      }, 1500);
    }
  },
}));
