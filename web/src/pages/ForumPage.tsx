// src/components/ForumPage.tsx
import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { axiosInstance } from '../lib/axios';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';

interface Thread {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  author: {
    username: string;
  };
}

interface Forum {
  _id: string;
  title: string;
  description: string;
  weaviateId: string;
  threads: Thread[];
}

const ForumPage: React.FC = () => {
  const { forumMongoId, forumWeaviateId } = useParams<{
    forumMongoId: string;
    forumWeaviateId: string;
  }>();
  const [forum, setForum] = useState<Forum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.includes('/admin');

  useEffect(() => {
    const fetchForum = async () => {
      try {
        const endpoint = isAdminRoute 
          ? `/admin/forums/${forumMongoId}/${forumWeaviateId}`
          : `/forums/${forumMongoId}/${forumWeaviateId}`;
          
        const response = await axiosInstance.get(endpoint);
        setForum(response.data.forum);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        const axiosError = err as AxiosError<{ msg: string }>;
        setError(axiosError.response?.data?.msg || 'Failed to load forum');
      }
    };

    if (forumMongoId && forumWeaviateId) fetchForum();
  }, [forumMongoId, forumWeaviateId, isAdminRoute]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!forum) return <div>Forum not found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{forum.title}</h1>
        <Link 
          to={`${isAdminRoute ? '/admin' : ''}/forums/${forumMongoId}/${forumWeaviateId}/create-thread`}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Thread
        </Link>
      </div>
      
      <p className="text-gray-600 mb-8">{forum.description}</p>

      <div className="space-y-4">
        {forum.threads.map(thread => (
          <div key={thread._id} className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold">{thread.title}</h3>
            <p className="text-gray-600 mt-2">{thread.description}</p>
            <div className="text-sm text-gray-500 mt-2">
              Posted by {thread.author.username} on{' '}
              {new Date(thread.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForumPage;