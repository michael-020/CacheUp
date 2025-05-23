export interface ShareState {
  content: string;
  selectedFile: File | null;
  imagePreview: string | null;
  error: string | null;
  isLoading: boolean;
  setContent: (content: string) => void;
  setSelectedFile: (file: File | null) => Promise<void>;
  clearForm: () => void;
  validatePost: () => boolean;
  submitPost: () => Promise<void>;
}