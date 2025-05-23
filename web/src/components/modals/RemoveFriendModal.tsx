import { Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface RemoveFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => Promise<void>;
  friendName?: string;
}

export const RemoveFriendModal = ({
  isOpen,
  onClose,
  onRemove,
  friendName,
}: RemoveFriendModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRemove = async () => {
    setIsLoading(true);
    await onRemove();
    setIsLoading(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Remove Friend
        </h3>
        <p className="mb-6 text-gray-700 dark:text-gray-400">
          Are you sure you want to remove
          {friendName ? (
            <span className="font-bold dark:text-gray-50"> {friendName} </span>
          ) : (
            " this friend "
          )}
          from your friends list? 
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleRemove}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin size-5 mx-4" /> : "Remove"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};