import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
export const useMatchStore = create((set) => ({


    matches: [],
    isLoadingMatches: false,

    getMyMatches: async()=>{
        try {
            set({ isLoadingMatches: true });
            const response = await axiosInstance.get('/matches');
            set({ matches: response.data.matches, isLoadingMatches: false });
        } catch (error) {
            console.error('Get My Matches Error:', error);
            set({ isLoadingMatches: false });
            const errorMessage = error.response?.data?.message || 'Failed to get matches';
            toast.error(errorMessage);
        }   
    }
}));
