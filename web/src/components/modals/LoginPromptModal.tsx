import { usePathStore } from "@/stores/PathStore/usePathStore";
import { X } from "lucide-react";
import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const LoginPromptModal = ({ isOpen, onClose, title, content }: LoginPromptModalProps) => {
  const { setUserLastPath } = usePathStore();
  const location = useLocation();
  const modalRef = useRef<HTMLDivElement>(null);

  const handleNavigation = () => {
    const authPaths = ['/', '/signin', '/signup', '/verify-email'];
    if (!authPaths.includes(location.pathname)) {
      setUserLastPath(location.pathname);
    }
    onClose();
  };

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
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50">
      <div ref={modalRef} className="relative w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="text-center pt-4">
            <h3 className="text-xl font-semibold mb-2 dark:text-white">
              {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {content}
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/signin"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={handleNavigation}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors dark:text-white"
                onClick={handleNavigation}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};