import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
export const useAuthStore = create((set) => ({
  //* states

  authUser: null,
  checkingAuth: true,
  loading: false,

  //* actions

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get('/auth/me');
      set({ authUser: response.data, checkingAuth: false });
      console.log(response.data);
      toast.success('Logged in successfully');
    } catch (error) {
      console.log(error);
      set({ checkingAuth: false });
      toast.error(error.response.data.message);
    }
  },
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
      set({ authUser: response.data, loading: false });
      console.log(response.data);
      toast.success('Registered successfully');
    } catch (error) {
      console.log(error);
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },
  login: async ({ email, password }) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });
      set({ authUser: response.data, loading: false });
      console.log(response.data);
      toast.success('Logged in successfully');
    } catch (error) {
      console.log(error);
      set({ loading: false });
      toast.error(error.response.data.message);
    }
  },
  logout: async () => {
    try {
      const response = await axiosInstance.get('/auth/logout');
      set({ authUser: null });
      console.log(response.data);
      toast.success('Logged out successfully');
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  },
}));
