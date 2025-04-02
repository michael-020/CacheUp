import { useEffect, useState, FC } from 'react';

interface ThreadModalProps {
  onClose: () => void;
  onSubmit: (data: { title: string; description: string }) => void;
}

const ThreadModal: FC<ThreadModalProps> = ({ onClose, onSubmit }) => {
  const [threadData, setThreadData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{title?: string; description?: string}>({});

  const validate = (): boolean => {
    const newErrors: {title?: string; description?: string} = {};
    
    if (!threadData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!threadData.description.trim()) {
      newErrors.description = 'Content is required';
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
    await onSubmit(threadData);
    setSubmitting(false);
  };

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Thread</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={threadData.title}
              onChange={(e) => setThreadData({...threadData, title: e.target.value})}
              className={`w-full p-2 border rounded ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div>
            <label className="block mb-2">Content</label>
            <textarea
              value={threadData.description}
              onChange={(e) => setThreadData({...threadData, description: e.target.value})}
              className={`w-full p-2 border rounded h-32 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {submitting ? 'Creating...' : 'Create Thread'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThreadModal;