import { useEffect, useState, FC, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Textarea } from '../ui/textarea';

interface ThreadModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
  forum?: boolean
}

const ThreadModal: FC<ThreadModalProps> = ({ onClose, onSubmit, forum }) => {
  const [threadData, setThreadData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{title?: string; description?: string}>({});
  const modalRef = useRef<HTMLDivElement | null>(null)

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
    
    setSubmitting(true);
    onSubmit(threadData);
    setSubmitting(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose()
      }
    };
    
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80  flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white dark:bg-neutral-800  rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-gray-200">{forum ? "Request New Forum" : "Create New thread"}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={threadData.title}
              onChange={(e) => setThreadData({...threadData, title: e.target.value})}
              placeholder='Title'
              className={`w-full p-2 border rounded dark:placeholder:text-gray-700 dark:bg-neutral-600 ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label className="block mb-2">Description</label>
            <Textarea
              value={threadData.description}
              onChange={(e) => setThreadData({...threadData, description: e.target.value})}
              placeholder='Content'
              rows={5}
              className={`w-full p-2 border resize-none rounded dark:placeholder:text-gray-700 dark:bg-neutral-600 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-4 self-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
             {forum 
                ? (submitting ? 'Requesting...' : 'Request Forum') 
                : (submitting ? 'Creating...' : 'Create Thread')
              }

            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ThreadModal;