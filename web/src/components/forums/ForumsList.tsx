import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { axiosInstance } from '../../lib/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SearchBar } from './search-bar';

interface Forum {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  isAdmin?: boolean;
  weaviateId: string;
}

interface ErrorResponse {
  msg: string;
}

const ForumList: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const isAdminRoute = location.pathname.includes('/admin');
  
  useEffect(() => {
    const fetchForums = async () => {
      try {
        
        const endpoint = isAdminRoute ? '/admin/get-forums' : '/forums/get-forums';
        const response = await axiosInstance.get(endpoint);
        setForums(response.data.allForums);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const axiosError = err as AxiosError<ErrorResponse>;
        setError(
          axiosError.response?.data?.msg || 'Failed to fetch forums. Please try again later.'
        );
      }
    };
    fetchForums();
  }, [isAdminRoute]);

  // const handleViewForum = (forumId: string) => {
  //   navigate(`${isAdminRoute ? '/admin' : ''}/forums/${forumId}`);
  // };
  const handleViewForum = (forum: Forum) => {
    navigate(
      `${isAdminRoute ? '/admin' : ''}/forums/create-thread/${forum._id}/${forum.weaviateId}`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">{isAdminRoute ? 'All Forums (Admin View)' : 'All Forums'}</h1>

      <SearchBar/>
      
      {forums.length === 0 ? (
        <p className="text-gray-600 text-center">No forums available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forums.map((forum) => (
            <div
              key={forum._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <h2 className="text-xl font-semibold mb-2 text-gray-800">{forum.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-3">{forum.description}</p>
              <div className="text-sm text-gray-500 mb-4">
                Created: {new Date(forum.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handleViewForum(forum)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
                >
                  View Threads
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ForumList;