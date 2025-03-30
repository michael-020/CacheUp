import React, { useState, FormEvent } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../lib/axios';
import toast from 'react-hot-toast';

interface ErrorResponse {
  msg: string;
  error: Array<{ message: string }>;
}

const CreateForum: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axiosInstance.post('/admin/create-forum', { title, description });
      
      toast.success('🎉 Forum created successfully! Redirecting...', {
        duration: 1000,
      });
      
      setLoading(false);
      setTitle('');
      setDescription('');
      
      setTimeout(() => {
        navigate('/admin/get-forums');
      }, 1000);
      
    } catch (err) {
      setLoading(false);
      const axiosError = err as AxiosError<ErrorResponse>;
      
      if (axiosError.response?.data) {
        const errorMessage = axiosError.response.status === 411
          ? axiosError.response.data.error.map(e => e.message).join(', ')
          : axiosError.response.data.msg || 'An error occurred';
          
        toast.error(errorMessage);
      } else {
        toast.error('❌ Failed to create forum. Please try again.');
      }
    }
  };

  return (
    <div className="max-w-2xl mt-20 mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Forum</h1>
      
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
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/forums')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md mr-2 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Forum'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateForum;
