import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { getSocketIfInitialized } from '../socket/socket.client.js';

export const useMatchStore = create((set) => ({
  matches: [],
  isLoadingMyMatches: false,
  isLoadingUserProfiles: false,
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
        matches: response.data.matches || response.data.users || [],
        isLoadingUserProfiles: false,
      });
    } catch (error) {
      console.error('Get User Profiles Error:', error);
      set({ isLoadingUserProfiles: false, matches: [] });
      const errorMessage =
        error.response?.data?.message || 'Failed to get user profiles';
      toast.error(errorMessage);
    }
  },

  subscribeToNewMatches: async () => {
    try {
      const socket = getSocketIfInitialized();
      if (!socket) return;
      socket.off('newMatch');
      socket.on('newMatch', (newMatch) => {
        set((prevState) => ({
          matches: [...prevState.matches, newMatch],
        }));
        toast.success("It's a match! 💕");
      });
    } catch (error) {
      console.error('Subscribe to New Matches Error:', error);
    }
  },

  unsubscribeFromNewMatches: async () => {
    try {
      const socket = getSocketIfInitialized();
      if (!socket) return;
      socket.off('newMatch');
    } catch (error) {
      console.error('Unsubscribe from New Matches Error:', error);
    }
  },

  swipeLeft: async (user) => {
    try {
      set({ swipeFeedback: 'passed' });

      // OPTIMIZATION: Optimistically remove swiped profile from matches deck
      set((state) => ({
        matches: state.matches.filter((m) => m._id !== user._id),
      }));

      await axiosInstance.post('/matches/swipe-left/' + user._id);
    } catch (error) {
      console.error('Swipe Left Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to swipe left';
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        set({ swipeFeedback: null });
      }, 500);
    }
  },

  swipeRight: async (user) => {
    try {
      set({ swipeFeedback: 'liked' });

      // OPTIMIZATION: Optimistically remove swiped profile from matches deck
      set((state) => ({
        matches: state.matches.filter((m) => m._id !== user._id),
      }));

      const response = await axiosInstance.post('/matches/swipe-right/' + user._id);

      if (response.data?.isMatch) {
        toast.success("It's a match! 💕");
      }
    } catch (error) {
      console.error('Swipe Right Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to swipe right';
      toast.error(errorMessage);
    } finally {
      setTimeout(() => {
        set({ swipeFeedback: null });
      }, 500);
    }
  },
}));