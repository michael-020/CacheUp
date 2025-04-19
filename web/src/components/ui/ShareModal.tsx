import { ReactNode, useEffect, useRef } from "react";
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const ShareModal = ({ isOpen, onClose, children }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md mx-auto">
        <div 
          ref={modalRef}
          className="dark:bg-neutral-800 bg-white rounded-lg p-5"
        >
          {children}
        </div>
        
        {/* Close button outside the content container */}
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-2 p-2 mt-4 mr-3  dark:bg-neutral-700 dark:hover:bg-neutral-600 z-20 shadow-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>
    </div>
  );
};