
// import { create } from 'zustand';
// import {axiosInstance} from '../../lib/axios';
// import { AxiosError } from 'axios';

// interface PFPState {
//   profileImage: string;
//   loading: boolean;
//   error: string | null;
//   fetchProfile: () => Promise<void>;
//   uploadProfileImage: (file: File) => Promise<void>;
//   deleteProfileImage: () => Promise<void>;
// }

// const usePFPStore = create<PFPState>((set) => ({
//   profileImage: '',
//   loading: false,
//   error: null,

//   fetchProfile: async () => {
//     try {
//       set({ loading: true, error: null });
//       const { data } = await axiosInstance.get<{ imagePath: string }>('/post/profilePicture/', {
//         withCredentials: true
//       });
//       set({ profileImage: data.imagePath || '' });
//     } catch (err) {
//       const error = err as AxiosError<{ msg: string }>;
//       set({ 
//         error: error.response?.data?.msg || error.message || 'Failed to fetch profile'
//       });
//     } finally {
//       set({ loading: false });
//     }
//   },

//   uploadProfileImage: async (file) => {
//     try {
//       set({ loading: true, error: null });
//       const formData = new FormData();
//       formData.append('picture', file);

//       const { data } = await axiosInstance.put<{ 
//         user: { profileImagePath: string } 
//       }>('/post/profilePicture/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//         withCredentials: true
//       });

//       set({ profileImage: data.user.profileImagePath });
//     } catch (err) {
//       const error = err as AxiosError<{ msg: string }>;
//       set({ 
//         error: error.response?.data?.msg || error.message || 'Upload failed' 
//       });
//     } finally {
//       set({ loading: false });
//     }
//   },

//   deleteProfileImage: async () => {
//     try {
//       set({ loading: true, error: null });
//       await axiosInstance.delete('/post/profilePicture/', { withCredentials: true });
//       set({ profileImage: '' });
//     } catch (err) {
//       const error = err as AxiosError<{ msg: string }>;
//       set({ 
//         error: error.response?.data?.msg || error.message || 'Delete failed' 
//       });
//     } finally {
//       set({ loading: false });
//     }
//   }
// }));

// export default usePFPStore;