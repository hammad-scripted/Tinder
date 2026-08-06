import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { initializeWebSocket } from '../socket/socket.client.js';
import {disconnectSocket} from '../socket/socket.client.js'
export const useAuthStore = create((set) => ({
  //* states
  authUser: null,
  checkingAuth: true, // Initialized to true on page load
  loading: false,

  //* actions

  // 1. Silent Auth Check on page load
  checkAuth: async () => {
    try {
      set({ checkingAuth: true, loading: true });
      const response = await axiosInstance.get('/auth/me');

      // Extract user object safely (handles response.data.user or response.data)
      const user = response.data.user || response.data;
      set({ authUser: user, checkingAuth: false, loading: false});
      initializeWebSocket(response.data.user._id);
    } catch (error) {
      console.error('CheckAuth Error:', error);
      set({ authUser: null, checkingAuth: false });
    }finally{
      set({ loading: false });
    }
  },

  //? 2. Signup Action
  signup: async ({ name, email, password, age, gender, genderPreference }) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post('/auth/signup', {
        name,
        email,
        password,
        age,
        gender,
        genderPreference,
      });

      const user = response.data.user || response.data;
      set({ authUser: user, loading: false });
      initializeWebSocket(response.data.user._id);
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Signup Error:', error);
      set({ loading: false });

      const errorMessage =
        error.response?.data?.message || 'Failed to create account';
      toast.error(errorMessage);
    }finally{
      set({ loading: false });
    }
  },

  //? 3. Login Action
  login: async ({ email, password }) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      const user = response.data.user || response.data;
      set({ authUser: user, loading: false });
      initializeWebSocket(response.data.user._id);

      toast.success('Logged in successfully');
    } catch (error) {
      console.error('Login Error:', error);
      set({ loading: false });

      const errorMessage =
        error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
    }finally{
      set({ loading: false });
    }
  },

  //? 4. Logout Action
  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      set({ authUser: null });
      disconnectSocket();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to log out';
      toast.error(errorMessage);
    }
  },
}));