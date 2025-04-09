import toast from 'react-hot-toast';

interface CustomToastProps {
  senderName: string;
  message: string;
  imageUrl?: string;
  onClose?: () => void;
  duration?: number;
}

export const showCustomMessageToast = ({ 
  senderName, 
  message, 
  imageUrl, 
  onClose,
  duration = 5000 
}: CustomToastProps) => {
  // Check if screen is at least md size (768px is standard medium breakpoint)
  const isMediumScreen = window.matchMedia('(min-width: 768px)').matches;
  
  // Create a unique ID for the toast to handle it properly
  const toastId = toast.custom(
    (t) => (
      <div
        style={{ marginTop: '3rem' }} // Added 3rem top margin
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white dark:bg-neutral-800 dark:text-gray-200 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        onClick={(e) => {
          // Prevent click from bubbling up and affecting parent elements
          e.stopPropagation();
        }}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <img
                className="h-10 w-10 rounded-full"
                src={imageUrl || "./avatar.jpeg"}
                alt={`${senderName}'s avatar`}
              />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                {senderName}
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                {message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200 dark:border-neutral-700">
          <button
            onClick={() => {
              toast.remove(t.id); // Use toast.remove instead of toast.dismiss
              
              // Execute any custom onClose callback if provided
              if (onClose) {
                onClose();
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
      // Position based on screen size
      position: isMediumScreen ? 'top-right' : 'top-center',
      // Set custom duration
      duration: duration,
      // Add this to make the toast immediately dismissible
      id: `message-toast-${Date.now()}`, // Ensure unique ID
    }
  );
  
  // Return the toast ID in case it needs to be programmatically dismissed elsewhere
  return toastId;
};