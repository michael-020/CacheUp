import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore'; 

const CreateForum: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const navigate = useNavigate();
  const { createForum, isCreatingForum } = useAdminStore();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      await createForum(title, description);
      toast.success('🎉 Forum created successfully! Redirecting...', { duration: 1000 });
      setTitle('');
      setDescription('');
      setTimeout(() => {
        navigate('/admin/get-forums');
      }, 1000);
    } catch (error) {
      
    }
  };

  return (
    <div className="max-w-2xl mt-20 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Forum</h1>
      
      <form onSubmit={handleSubmit}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Forum Title*
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter forum title"
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description*
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={5}
            placeholder="Provide a description (minimum 10 characters)"
            required
            minLength={10}
          ></textarea>
        </div>
      </form>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/home')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isCreatingForum}
          >
            {isCreatingForum ? 'Creating...' : 'Create Forum'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForum;