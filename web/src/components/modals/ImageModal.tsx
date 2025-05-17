import { X } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

interface ImageModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => createPortal(
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80"
    onClick={onClose}
  >
    <div className="relative flex flex-col items-center justify-center pt-10">
      {/* X icon at top-left of the modal content */}
      <button
        className="absolute top-1 left-0 text-white text-3xl font-bold z-50"
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        <X size={32} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] md:max-h-[80vh] rounded-lg shadow-lg border-4 border-white"
        onClick={e => e.stopPropagation()}
      />
    </div>
  </div>,
  document.body
);

export default ImageModal;