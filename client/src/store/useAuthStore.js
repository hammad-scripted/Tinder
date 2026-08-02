import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
export const useAuthStore = create((set) => ({
//* states

authUser: null,
checkingAuth:true,
loading: false,

//* actions

checkAuth:async()=>{

    try {
        
        const response = await axiosInstance.get("/auth/me");
        set({authUser:response.data,checkingAuth:false})
        console.log(response.data);
    } catch (error) {
        console.log(error);
        set({checkingAuth:false})
        
    }
}
}));

