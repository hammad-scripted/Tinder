import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
export const useUserStore = create((set) => ({
  loading: false,
  updateProfile: async ({
    name,
    bio,
    age,
    gender,
    genderPreference,
    image,
  }) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.put('/users/update', {
        name,
        bio,
        age,
        gender,
        genderPreference,
        image,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Update Profile Error:', error);
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));
