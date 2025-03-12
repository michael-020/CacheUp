import { create } from 'zustand';
import { usePostStore } from '../PostStore/usePostStore'; 
import { ShareState } from './types';

export const useShareStore = create<ShareState>((set, get) => ({
  content: '',
  selectedFile: null,
  imagePreview: null,
  error: null,
  isLoading: false,

  setContent: (content) => set({ content }),
  
  setSelectedFile: async (file) => {
    if (!file) {
      set({ selectedFile: null, imagePreview: null });
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    return new Promise((resolve) => {
      reader.onload = () => {
        set({
          selectedFile: file,
          imagePreview: reader.result as string
        });
        resolve();
      };
    });
  },

  clearForm: () => set({
    content: '',
    selectedFile: null,
    imagePreview: null,
    error: null
  }),

  validatePost: () => {
    const { content, selectedFile } = get();
    
    if (!content.trim() && !selectedFile) {
      set({ error: 'Please write something or add an image' });
      return false;
    }
    
    if (content.length > 200) { 
      set({ error: 'Post text cannot exceed 200 characters' });
      return false;
    }
    
    set({ error: null });
    return true;
  },

  

  // submitPost: async () => {
  //   const { validatePost, content, selectedFile, clearForm } = get();
  //   if (!validatePost()) return;
  
  //   set({ isLoading: true, error: null });
  
  //   try {
  //     const formData = new FormData();
  //     if (content) formData.append('text', content);
  //     if (selectedFile) formData.append('image', selectedFile);
  
  //     await usePostStore.getState().createPost(formData);
  //     clearForm();
  //   } catch (error: any) {
  //     set({ error: error.response?.data?.msg || 'Failed to create post' });
  //   } finally {
  //     set({ isLoading: false });
  //   }
  // }

  // In your submitPost action
submitPost: async () => {
  const { validatePost, content, selectedFile, clearForm } = get();
  if (!validatePost()) return;

  set({ isLoading: true, error: null });

  try {
    const formData = new FormData();
    if (content.trim()) formData.append('text', content.trim());
    if (selectedFile) formData.append('image', selectedFile);

    await usePostStore.getState().createPost(formData);
    clearForm();
  } catch (error: any) {
    set({ error: error.message || 'Failed to create post' });
  } finally {
    set({ isLoading: false });
  }
},
}));