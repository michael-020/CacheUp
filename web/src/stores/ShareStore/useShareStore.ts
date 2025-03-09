import { create } from 'zustand';

export interface ShareState {
  content: string;
  selectedFile: File | null;
  imagePreview: string | null;
  error: string | null;
  setContent: (content: string) => void;
  setSelectedFile: (file: File | null) => Promise<void>;
  clearForm: () => void;
  validatePost: () => boolean;
}

export const useShareStore = create<ShareState>((set, get) => ({
  content: '',
  selectedFile: null,
  imagePreview: null,
  error: null,

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
    
    if (content.length > 500) {
      set({ error: 'Post content cannot exceed 500 characters' });
      return false;
    }
    
    set({ error: null });
    return true;
  }
}));