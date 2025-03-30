
import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { axiosInstance } from '../../lib/axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';

const CreateThread: React.FC = () => {
  const { forumMongoId, forumWeaviateId } = useParams<{
    forumMongoId: string;
    forumWeaviateId: string;
  }>();
  const [newThread, setNewThread] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.includes('/admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const endpoint = isAdminRoute 
        ? `/admin/forums/${forumMongoId}/${forumWeaviateId}`
        : `/forums/create-thread/${forumMongoId}/${forumWeaviateId}`;

      await axiosInstance.post(endpoint, newThread);
      navigate(`${isAdminRoute ? '/admin' : ''}/forums/create-thread/${forumMongoId}/${forumWeaviateId}`);
    } catch (err) {
      const axiosError = err as AxiosError<{ msg: string }>;
      setError(axiosError.response?.data?.msg || 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">Create New Thread</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={newThread.title}
            onChange={(e) => setNewThread({...newThread, title: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block mb-2">Content</label>
          <textarea
            name="description"
            value={newThread.description}
            onChange={(e) => setNewThread({...newThread, description: e.target.value})}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>

        {error && <div className="text-red-500">{error}</div>}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {submitting ? 'Creating...' : 'Create Thread'}
          </button>
          
          <Link
            to={`${isAdminRoute ? '/admin' : ''}/forums/create-thread/${forumMongoId}/${forumWeaviateId}`}
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateThread;