import React, { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { axiosInstance } from '../lib/axios';
import { useParams, Link, useLocation } from 'react-router-dom';
import ThreadModal from '../components/forums/ThreadModal';
import { IUser } from '@/lib/utils';

interface Thread {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  weaviateId: string;
  createdBy: IUser;
}

const ForumPage: React.FC = () => {
  const { forumMongoId, forumWeaviateId } = useParams<{
    forumMongoId: string;
    forumWeaviateId: string;
  }>();
  
  const [threads, setThreads] = useState<Thread[]>([]);
  const [forumTitle, setForumTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.includes('/admin');

  const fetchForumDetails = async () => {
    setLoading(true);
    
    try {
      // Fetch forum details
      console.log('Fetching forum details for ID:', forumMongoId);
      const forumResponse = await axiosInstance.get(`/forums/${forumMongoId}`);
      console.log('Forum response:', forumResponse.data);
      setForumTitle(forumResponse.data.forum.title || 'Forum');
      setError('');
    } catch (err) {
      console.error('Error fetching forum details:', err);
      setForumTitle('Forum');
    }
    
    try {
      const threadsResponse = await axiosInstance.get(`/forums/get-threads/${forumMongoId}`);
      console.log('Threads response:', threadsResponse.data);
      setThreads(threadsResponse.data.allThreads);
    } catch (err) {
      console.error('Error fetching threads:', err);
      const axiosError = err as AxiosError<{ msg: string }>;
      setError(axiosError.response?.data?.msg || 'Failed to fetch threads');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForumDetails();
  }, [forumMongoId, forumWeaviateId]);

  const handleCreateThread = async (threadData: { title: string; description: string }) => {
    try {
      const endpoint = isAdminRoute 
        ? `/admin/forums/${forumMongoId}/${forumWeaviateId}`
        : `/forums/create-thread/${forumMongoId}/${forumWeaviateId}`;

      await axiosInstance.post(endpoint, threadData);
      setShowModal(false);
      fetchForumDetails();
    } catch (err) {
      const axiosError = err as AxiosError<{ msg: string }>;
      setError(axiosError.response?.data?.msg || 'Failed to create thread');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{forumTitle}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Thread
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {loading ? (
        <div className="text-center py-8">Loading forum content...</div>
      ) : threads.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded">
          <p>No threads found in this forum.</p>
          <p className="mt-2">Be the first to create a thread!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <div key={thread._id} className="border p-4 rounded hover:bg-gray-50">
              <h2 className="text-xl font-semibold">{thread.title}</h2>
              <p className="mt-2 text-gray-600">{thread.description}</p>
              <div className="mt-3 flex justify-between text-sm text-gray-500">
                <span>Created: {new Date(thread.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ThreadModal 
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateThread}
        />
      )}
    </div>
  );
};

export default ForumPage;
