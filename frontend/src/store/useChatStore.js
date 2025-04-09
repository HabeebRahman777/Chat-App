import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  sentRequests:[],
  requests:[],
  friends:[],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/message/${userId}`);
      set({ messages: res.data });
      set({isMessagesLoading: false })
    } catch (error) {
        console.error("Error object:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
        } else {
          console.error("No response received. Possible network issue or CORS error.");
        }
    }
    
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  fetchSentRequests:async ()=>{
    try {
      const { authUser } = useAuthStore.getState();
      const response = await axiosInstance.get(`/message/sent-requests/${authUser._id}`);
      set({ 
        sentRequests:response.data.sentRequests 
      });
    } catch (error) {
      console.error("Error fetching sent requests:", error.response?.data?.message || error.message);
    }
  },

  fetchRequests:async ()=>{
    try {
      const { authUser } = useAuthStore.getState();
      const response = await axiosInstance.get(`/message/requests/${authUser._id}`);
      set({ 
        requests:response.data.requests 
      });
    } catch (error) {
      console.error("Error fetching requests:", error.response?.data?.message || error.message);
    }
  },

  fetchFriends:async ()=>{
    try {
      const { authUser } = useAuthStore.getState();
      const response= await axiosInstance.get(`/message/friends/${authUser._id}`)
      set({
        friends:response.data.friends
      })
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  },


  setSelectedUser: (selectedUser) => set({ selectedUser }),


}));