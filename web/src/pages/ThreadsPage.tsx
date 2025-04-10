import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useForumStore } from '@/stores/ForumStore/forumStore';
import ThreadModal from '../components/forums/ThreadModal';
import { ArrowLeft } from 'lucide-react';
import { motion } from "framer-motion"
import { routeVariants } from '@/lib/routeAnimation';

const ForumPage: React.FC = () => {
  const { forumMongoId, forumWeaviateId } = useParams<{
    forumMongoId: string;
    forumWeaviateId: string;
  }>();
  
  const {
    currentForum,
    fetchForumDetails,
    fetchThreads,
    createThread
  } = useForumStore();
  
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate()
  const isAdminRoute = location.pathname.includes('/admin');
  const linkToPosts = isAdminRoute ? "/admin/forums/thread/" : "/forums/thread/"
  useEffect(() => {
    if (forumMongoId) {
      fetchForumDetails(forumMongoId);
      fetchThreads(forumMongoId, isAdminRoute);
    }
  }, [forumMongoId, fetchForumDetails, fetchThreads, isAdminRoute]);

  const handleCreateThread = async (threadData: { title: string; description: string }) => {
    try {
      if (!forumMongoId || !forumWeaviateId) return;
      await createThread(forumMongoId, forumWeaviateId, threadData, isAdminRoute);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  return (
    <motion.div
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-6xl mx-auto p-6 translate-y-24 h-full">
        <div className="flex justify-between items-center mb-6">
          <button
              onClick={() => navigate(-1)}
              className="mr-4 p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold">{currentForum.title}</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Thread
          </button>
        </div>

        {currentForum.error && <div className="text-red-500 mb-4">{currentForum.error}</div>}
        
        {currentForum.loading ? (
          <div className="text-center py-8">Loading forum content...</div>
        ) : currentForum.threads.length === 0 ? (
          <div className="text-center py-8 bg-gray-100 rounded">
            <p>No threads found in this forum.</p>
            <p className="mt-2">Be the first to create a thread!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentForum.threads.map((thread) => (
              <div key={thread._id}>
                <Link to={linkToPosts+thread._id}>
                  <div className="border p-4 rounded hover:bg-gray-50 dark:hover:bg-neutral-700">
                    <h2 className="text-xl font-semibold">{thread.title}</h2>
                    <p className="mt-2 text-gray-600">{thread.description}</p>
                    <div className="mt-3 flex justify-between text-sm text-gray-500">
                      <span>Created: {new Date(thread.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
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
    </motion.div>
  );
};

export default ForumPage;