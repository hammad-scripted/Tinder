import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client.js";

export const useMatchStore = create((set) => ({
  matches: [],
  isLoadingMyMatches: false,
  isLoadingUserProfiles: false,
  userProfiles: [],
  swipeFeedback: null,

  getMyMatches: async () => {
    try {
      set({ isLoadingMyMatches: true });
      const res = await axiosInstance.get("/matches");
      set({ matches: res.data.matches || [] });
    } catch (error) {
      set({ matches: [] });
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoadingMyMatches: false });
    }
  },

  getUserProfiles: async () => {
    try {
      set({ isLoadingUserProfiles: true });
      const res = await axiosInstance.get("/matches/user-profiles");
      
      // Target res.data.users with fallback to res.data.matches to prevent undefined.length crashes
      set({ userProfiles: res.data.users || res.data.matches || [] });
    } catch (error) {
      set({ userProfiles: [] });
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isLoadingUserProfiles: false });
    }
  },

  swipeLeft: async (user) => {
    try {
      set({ swipeFeedback: "passed" });

      // OPTIMIZATION: Optimistically filter out swiped user from swipe deck
      set((state) => ({
        userProfiles: (state.userProfiles || []).filter((p) => p._id !== user._id),
      }));

      await axiosInstance.post("/matches/swipe-left/" + user._id);
    } catch (error) {
      console.error("Swipe Left Error:", error);
      toast.error(error.response?.data?.message || "Failed to swipe left");
    } finally {
      setTimeout(() => set({ swipeFeedback: null }), 500);
    }
  },

  swipeRight: async (user) => {
    try {
      set({ swipeFeedback: "liked" });

      // OPTIMIZATION: Optimistically filter out swiped user from swipe deck
      set((state) => ({
        userProfiles: (state.userProfiles || []).filter((p) => p._id !== user._id),
      }));

      const res = await axiosInstance.post("/matches/swipe-right/" + user._id);

      if (res.data?.isMatch) {
        toast.success("It's a match! 💕");
      }
    } catch (error) {
      console.error("Swipe Right Error:", error);
      toast.error(error.response?.data?.message || "Failed to swipe right");
    } finally {
      setTimeout(() => set({ swipeFeedback: null }), 500);
    }
  },

  subscribeToNewMatches: () => {
    try {
      const socket = getSocket();
      if (!socket) return;

      socket.off("newMatch"); // Remove existing listeners to avoid duplicate triggers
      socket.on("newMatch", (newMatch) => {
        set((state) => ({
          matches: Array.isArray(state.matches)
            ? [...state.matches, newMatch]
            : [newMatch],
        }));
        toast.success("You got a new match!");
      });
    } catch (error) {
      console.error("Subscribe error:", error);
    }
  },

  unsubscribeFromNewMatches: () => {
    try {
      const socket = getSocket();
      if (!socket) return;
      socket.off("newMatch");
    } catch (error) {
      console.error("Unsubscribe error:", error);
    }
  },
}));