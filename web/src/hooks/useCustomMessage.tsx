// useCustomMessageToast.tsx
import { ShowCustomMessageToast } from '@/components/Toast/CustomMessageToast';
import { IUser } from '@/lib/utils';
import { useChatStore } from '@/stores/chatStore/useChatStore';


interface CustomToastProps {
  sender: IUser;
  senderName: string;
  message: string;
  imageUrl?: string;
  onClose?: () => void;
  duration?: number;
}

// Custom hook for message toast functionality
export const useCustomMessageToast = () => {
  const { setSelectedUser } = useChatStore();

  const showToast = ({ 
    sender,
    senderName, 
    message, 
    imageUrl, 
    onClose,
    duration = 5000 
  }: CustomToastProps) => {
    return ShowCustomMessageToast({
      sender,
      senderName,
      message,
      imageUrl,
      onClose,
      duration,
      onSelectUser: (user) => {
        setSelectedUser(user);
      }
    });
  };
  
  return showToast;
};