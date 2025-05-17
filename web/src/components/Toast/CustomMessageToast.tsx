// CustomMessageToast.tsx
import { IUser } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface CustomToastProps {
  sender: IUser;
  senderName: string;
  message: string;
  imageUrl?: string;
  onClose?: () => void;
  duration?: number;
  onSelectUser?: (sender: IUser) => void;
}

// This function is used in the store and doesn't use hooks directly
export const ShowCustomMessageToast = (props: CustomToastProps) => {
  // We can't use hooks here, so we just pass the props to the toast library
  return toast.custom(
    (t) => (
      <div
        style={{ marginTop: '3rem' }}
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white dark:bg-neutral-800 dark:text-gray-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <Link 
          to="/message" 
          className="flex-1 cursor-pointer"
          onClick={() => {
            // First set the selected user
            if (props.onSelectUser) {
              props.onSelectUser(props.sender);
            }
            
            // Then close the toast
            toast.remove(t.id);
          }}
        >
          <div className="flex-1 w-full p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src={props.imageUrl || "./avatar.jpeg"}
                  alt={`${props.senderName}'s avatar`}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                  {props.senderName}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                  {props.message}
                </p>
              </div>
            </div>
          </div>
        </Link>
        <div className="flex border-l border-gray-200 dark:border-neutral-700">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent the parent div's onClick from firing
              toast.remove(t.id);
              if (props.onClose) {
                props.onClose();
              }
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    ),
    {
      position: window.matchMedia('(min-width: 768px)').matches ? 'top-right' : 'top-center',
      duration: props.duration || 5000,
      id: `message-toast-${Date.now()}`,
    }
  );
};