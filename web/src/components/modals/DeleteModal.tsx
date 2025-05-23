import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DeleteConfirmationModalProps {
  deleteHandler: () => void;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  content?: string;
  isDeleting?: boolean;
  title?: string;
}

export function DeleteModal({
  deleteHandler,
  isModalOpen,
  setIsModalOpen,
  content,
  isDeleting = false,
  title = "Confirm Delete"
}: DeleteConfirmationModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };
    
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, setIsModalOpen]);

  const onClickHandler = async () => {
    setIsLoading(true)
    try {
      await deleteHandler();
    } catch (error) {
      console.log("error in deleting", error)
    } finally {
      setIsLoading(false)
    }

    setIsModalOpen(false);
  };

  if (!isModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80  flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-neutral-700 p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        <h3 className="text-lg font-medium mb-4 text-left dark:text-white">{title}</h3>
        <p className="mb-6 text-left text-gray-800 dark:text-gray-200">
          {content || "Are you sure you want to delete this? This action cannot be undone."}
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={onClickHandler}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            disabled={isDeleting || isLoading}
          >
            {(isDeleting || isLoading) ? (
                <Loader className="animate-spin size-5 mx-4" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}