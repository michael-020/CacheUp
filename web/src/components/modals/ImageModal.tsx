import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ImageModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        imageContainerRef.current &&
        !imageContainerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [onClose]);

  if (typeof window === "undefined" || !document.body) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80"
      style={{ touchAction: "none" }}
    >
      <div
        className="relative flex flex-col items-center justify-center pt-10 w-full max-w-full"
        style={{ maxWidth: "100vw" }}
      >
        {/* Image container for correct button positioning */}
        <div className="relative inline-block" ref={imageContainerRef}>
          <button
            className="absolute top-2 left-2 text-white text-3xl font-bold z-50 bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={28} />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[98vw] md:max-h-[80vh] rounded-lg shadow-lg border-4 border-white"
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
            draggable={false}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;