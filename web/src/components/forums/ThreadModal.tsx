import { useEffect, useState, FC, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Textarea } from '../ui/textarea';
import { Loader2 } from 'lucide-react';

interface ThreadModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => Promise<void>;
  forum?: boolean
}

const ThreadModal: FC<ThreadModalProps> = ({ onClose, onSubmit, forum }) => {
  const [threadData, setThreadData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{title?: string; description?: string}>({});
  const modalRef = useRef<HTMLDivElement | null>(null);

  const validate = (): boolean => {
    const newErrors: {title?: string; description?: string} = {};
    
    if (!threadData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!threadData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
        return;
    }
    
    try {
        setSubmitting(true);
        await onSubmit(threadData);
    } catch (error) {
        console.error('Error creating:', error);
        // Don't close modal, just set submitting to false
    } finally {
        setSubmitting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!submitting && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, submitting]);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md relative">
        {submitting && (
          <div className="absolute inset-0 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-50">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {forum ? "Creating request..." : "Creating thread..."}
              </p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-gray-200">
            {forum ? "Request New Forum" : "Create New thread"}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <div>
            <label className="block mb-2">{forum ? "Forum Title" : "Title"}</label>
            <input
              type="text"
              value={threadData.title}
              onChange={(e) => setThreadData({...threadData, title: e.target.value})}
              placeholder='Title'
              className={`w-full p-2 border rounded placeholder:text-neutral-300 dark:placeholder:text-gray-700 dark:bg-neutral-600 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            <div className="text-right text-xs pt-1 text-gray-500 ">
                {threadData.title.length}/50
              </div>
          </div>
          
          <div>
            <label className="block mb-2">{forum ? "Forum Description" : "Description"}</label>
            <Textarea
              value={threadData.description}
              onChange={(e) => setThreadData({...threadData, description: e.target.value})}
              placeholder='Content'
              rows={5}
              className={`w-full p-2 border resize-none rounded placeholder:text-neutral-300 dark:placeholder:text-gray-700 dark:bg-neutral-600 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-4 self-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-400 flex items-center justify-center min-w-[120px] ${submitting ? "bg-blue-700" : ""}`}
            >
              {submitting ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                forum ? "Create Request" : "Create Thread"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ThreadModal;