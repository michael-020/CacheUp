import { FC, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuidelinesModal: FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
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
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset'; // Restore scrolling
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl w-full max-w-xl mx-12 relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-neutral-700">
          <h2 className="text-xl font-semibold dark:text-white">Forum Guidelines</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              General Rules
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Be respectful to all community members</li>
              <li>No hate speech, discrimination, or harassment</li>
              <li>Keep discussions civil and constructive</li>
              <li>No spam or self-promotion</li>
            </ul>

            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 pt-2">
              Posting Guidelines
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Use clear, descriptive titles for your threads</li>
              <li>Post content in the appropriate forum sections</li>
              <li>Check for existing threads before creating a new one</li>
              <li>Provide context and clear information in your posts</li>
            </ul>

            <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 pt-2">
              Content Rules
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>No explicit or inappropriate content</li>
              <li>Respect intellectual property rights</li>
              <li>Don't share personal or confidential information</li>
              <li>Keep content relevant to the community</li>
            </ul>

            <p className="text-sm text-gray-600 dark:text-gray-400 pt-4">
              Violation of these guidelines may result in post removal or account restrictions.
              We encourage open discussion while maintaining a respectful environment for all users.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t dark:border-neutral-700 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GuidelinesModal;