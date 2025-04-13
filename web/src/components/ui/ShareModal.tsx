import { ReactNode } from "react";
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
  }
  
 export  const ShareModal = ({ isOpen, onClose, children }:ModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg w-full max-w-md mx-auto relative">
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 z-20"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {children}
        </div>
      </div>
    );
  };
  