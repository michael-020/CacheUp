import { Loader2 } from "lucide-react";
import { createPortal } from "react-dom";

export const LogoutLoadingModal = () => {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-8 flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Logging out...
        </p>
      </div>
    </div>,
    document.body
  );
};