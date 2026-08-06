import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { getSocket, getSocketIfInitialized } from '../socket/socket.client.js';
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
            sender: useAuthStore.getState().authUser._id,
            receiver: receiverId,
            message: content,
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
    const socket = getSocketIfInitialized();
    if (!socket) return;
    socket.off('newMessage');
    socket.on('newMessage', (message) => {
      set((prevState) => ({
        messages: [...prevState.messages, message],
      }));
    });
  },
  unsubscribeFromMessages: () => {
    const socket = getSocketIfInitialized();
    if (!socket) return;
    socket.off('newMessage');
  },
}));
