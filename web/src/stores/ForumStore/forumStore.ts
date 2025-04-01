import {create} from 'zustand';
import { axiosInstance } from '@/lib/axios';
import type { ForumStore } from '@/stores/ForumStore/types';
import { AxiosError } from "axios";

export const useForumStore = create<ForumStore>((set, get) => ({
  forums: [],
  currentForum: {
    title: '',
    threads: [],
    loading: false,
    error: '',
  },
  loadingForums: false,
  errorForums: '',
  loading: false,
  error: '',

  
  fetchForums: async (isAdminRoute) => {
    set({ loadingForums: true, errorForums: '' });
    try {
      const endpoint = isAdminRoute ? '/admin/get-forums' : '/forums/get-forums';
      const response = await axiosInstance.get(endpoint);
      set({ forums: response.data.allForums, loadingForums: false });
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      set({ 
        errorForums: error.response?.data?.msg || 'Failed to fetch forums',
        loadingForums: false 
      });
    }
  },

  deleteForum: async (forumId, weaviateId) => {
    try {
      await axiosInstance.delete(`/admin/delete-forum/${forumId}/${weaviateId}`);
      set((state) => ({
        forums: state.forums.filter(f => f._id !== forumId)
      }));
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  },

  
  fetchForumDetails: async (forumId) => {
    set({ currentForum: { ...get().currentForum, loading: true, error: '' } });
    try {
      const response = await axiosInstance.get(`/forums/${forumId}`);
      set({ currentForum: { ...get().currentForum, title: response.data.forum.title } });
    } catch (err) {
    //   const error = err as AxiosError<{ msg: string }>;
    //   set({ currentForum: { ...get().currentForum, error: error.response?.data?.msg || 'Failed to fetch forum' } });
    }
  },

  fetchThreads: async (forumId) => {
    set({ currentForum: { ...get().currentForum, loading: true } });
    try {
      const response = await axiosInstance.get(`/forums/get-threads/${forumId}`);
      set({ currentForum: { ...get().currentForum, threads: response.data.allThreads, loading: false } });
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      set({ currentForum: { ...get().currentForum, error: error.response?.data?.msg || 'Failed to fetch threads', loading: false } });
    }
  },

  createThread: async (forumId, weaviateId, threadData, isAdminRoute) => {
    try {
      const endpoint = isAdminRoute 
        ? `/admin/forums/${forumId}/${weaviateId}`
        : `/forums/create-thread/${forumId}/${weaviateId}`;

      await axiosInstance.post(endpoint, threadData);
      get().fetchThreads(forumId);
    } catch (err) {
      const error = err as AxiosError<{ msg: string }>;
      throw error;
    }
  }
}));