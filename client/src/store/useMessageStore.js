import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import {getSocket} from '../socket/socket.client.js';
import { toast } from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

export const useMessageStore = create((set) => ({
  messages: [],
  loading: true,

  sendMessages: async (receiverId, content) => {
    try {
      set((prevState) => ({
        messages: [
          ...prevState.messages,
          {
            senderId: useAuthStore.getState().authUser._id,
            receiverId,
            content,
          },
        ],
      }));
      const response = await axiosInstance.post('/messages/send', {
        receiverId,
        content,
      });
      console.log(response.data);
    } catch (error) {
      console.error('Send Message Error:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);
    }
  },
  getMessages: async (userId) => {
    try {
      set({ loading: true });
      const response = await axiosInstance.get(
        `/messages/conversation/${userId}`,
      );
      set({ messages: response.data.messages, loading: false });
    } catch (error) {
      console.error('Get Messages Error:', error);
      set({ loading: false, messages: [] });
      const errorMessage =
        error.response?.data?.message || 'Failed to get messages';
      toast.error(errorMessage);
    }
  },
  subscribeToMessages: () => {
    const socket = getSocket();
    socket.on('newMessage', (message) => {
      set((prevState) => ({
        messages: [...prevState.messages, message],
      }));
    });
  },
  unsubscribeFromMessages: () => {
    const socket = getSocket();
    socket.off('newMessage');
  },
}));
