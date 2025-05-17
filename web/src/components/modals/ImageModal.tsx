import { X, Plus, Minus, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ImageModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

const MIN_SCALE = 1;
const MAX_SCALE = 3;
const SCALE_STEP = 0.2;

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const lastTouchDistance = useRef<number | null>(null);

  // Prevent background scroll
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Outside click handler
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

  // Pinch-to-zoom handlers
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    function getDistance(touches: TouchList) {
      if (touches.length < 2) return 0;
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length === 2) {
        lastTouchDistance.current = getDistance(e.touches);
      }
    }

    function onTouchMove(e: TouchEvent) {
      if (e.touches.length === 2 && lastTouchDistance.current) {
        const newDistance = getDistance(e.touches);
        const delta = newDistance - lastTouchDistance.current;
        if (Math.abs(delta) > 5) { // threshold to avoid jitter
          setScale(prev => {
            let next = prev + (delta > 0 ? 0.05 : -0.05);
            next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
            return +next.toFixed(2);
          });
          lastTouchDistance.current = newDistance;
        }
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        lastTouchDistance.current = null;
      }
    }

    container.addEventListener("touchstart", onTouchStart, { passive: false });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd);

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // Trackpad zoom (ctrl+wheel)
  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) return;

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey) {
        e.preventDefault();
        setScale(prev => {
          let next = prev - e.deltaY * 0.01;
          next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
          return +next.toFixed(2);
        });
      }
    }
    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
    };
  }, []);

  if (typeof window === "undefined" || !document.body) return null;

  const handleZoomIn = () => setScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(2)));
  const handleZoomOut = () => setScale((s) => Math.max(MIN_SCALE, +(s - SCALE_STEP).toFixed(2)));
  const handleReset = () => setScale(1);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80"
      style={{ touchAction: "none" }}
    >
      <div
        className="relative flex flex-col items-center justify-center pt-10 w-full max-w-full"
        style={{ maxWidth: "100vw" }}
      >
        <div
          className="relative inline-block overflow-hidden bg-black max-w-[98vw] max-h-[90vh] rounded-md border-2 border-neutral-200 dark:border-neutral-400"
          ref={imageContainerRef}
          style={{
            width: "min(98vw, 700px)",
            height: "min(90vh, 80vw)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Close Button */}
          <button
            className="absolute top-2 left-2 text-white text-3xl font-bold z-50 bg-black/60 rounded-full p-1.5 hover:bg-black/80 transition"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={28} />
          </button>
          {/* Zoom Controls */}
          <div className="absolute top-2 right-2 flex gap-2 z-50">
            <button
              className={`bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition ${scale <= MIN_SCALE ? "text-neutral-700" : ""}`}
              onClick={handleZoomOut}
              aria-label="Zoom out"
              disabled={scale <= MIN_SCALE}
              type="button"
            >
              <Minus size={22} />
            </button>
            <button
              className={`bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition ${scale === 1 ? "text-neutral-700" : ""} `}
              onClick={handleReset}
              aria-label="Reset zoom"
              disabled={scale === 1}
              type="button"
            >
              <RefreshCw size={22} />
            </button>
            <button
              className={`bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition ${scale >= MAX_SCALE ? "text-neutral-700" : ""}`}
              onClick={handleZoomIn}
              aria-label="Zoom in"
              disabled={scale >= MAX_SCALE}
              type="button"
            >
              <Plus size={22} />
            </button>
          </div>
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 m-auto transition-transform duration-200"
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              transform: `scale(${scale})`,
              cursor: scale > 1 ? "grab" : "default",
              touchAction: "none",
              userSelect: "none",
              pointerEvents: "auto",
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;