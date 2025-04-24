import { ReactNode, useEffect, useRef } from "react";
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export const ShareModal = ({ isOpen, onClose, children }: ShareModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-4xl mx-auto">
        <div 
          ref={modalRef}
          className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl"
        >
          {/* Content */}
          <div className="pt-9">
            {children}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 p-2 bg-white dark:bg-neutral-700 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-neutral-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};