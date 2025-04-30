import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useForumStore } from '@/stores/ForumStore/forumStore';
import ThreadModal from '../components/forums/ThreadModal';
import { ArrowLeft } from 'lucide-react';
import ForumPageSkeleton from '../components/skeletons/ForumPageSkeleton';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore'; 
import { MoreVertical } from 'lucide-react';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore';
import { DeleteModal } from '@/components/DeleteModal';
import { SearchBar } from '@/components/forums/search-bar';
import { Helmet } from 'react-helmet-async';

const ForumPage: React.FC = () => {
  const { forumMongoId, forumWeaviateId } = useParams<{
    forumMongoId: string;
    forumWeaviateId: string;
  }>();
  
  const { authAdmin } = useAdminStore()

  const {
    currentForum,
    fetchThreads,
    createThread,
    deleteThread,
  } = useForumStore();
  
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Explicit loading state
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.includes('/admin');
  const linkToPosts = isAdminRoute ? "/admin/forums/thread/" : "/forums/thread/";
  const { authUser } = useAuthStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<{id: string, weaviateId: string} | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (forumMongoId) {
        await fetchThreads(forumMongoId, isAdminRoute);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    };
    
    loadData();
  }, [forumMongoId, fetchThreads, isAdminRoute]);

  const handleCreateThread = async (threadData: { title: string; description: string }) => {
    try {
      if (!forumMongoId || !forumWeaviateId) return;
      await createThread(forumMongoId, forumWeaviateId, threadData, isAdminRoute);
      setShowModal(false);
    } catch (err) {
      console.error('Failed to create thread:', err);
    }
  };

  const handleDeleteThread = () => {
    if (threadToDelete) {
      deleteThread(threadToDelete.id, threadToDelete.weaviateId);
      setShowDeleteModal(false);
      setThreadToDelete(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Show skeleton while loading
  if (isLoading || currentForum.loading) {
    return <ForumPageSkeleton />;
  }
  
  return (
    <div className='pb-24 dark:bg-neutral-950 min-h-screen'>
      <Helmet>
        <title>{`${currentForum.title} | Forum Discussions`}</title>
      </Helmet>
      <div className="max-w-6xl mx-auto p-6 translate-y-24 h-full" >
      <SearchBar />
        <div className="flex justify-between items-center mb-6">
          <button
              onClick={() => navigate(-1)}
              className="mr-4 p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700"
          >
            <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold">{currentForum.title}'s Forum</h1>
          {authUser && <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Thread
          </button>
          }
        </div>

        {currentForum.error && <div className="text-red-500 mb-4">{currentForum.error}</div>}
        
        {currentForum.threads.length === 0 ? (
          <div className="text-center py-8 bg-white rounded dark:bg-neutral-800 ">
            <p>No threads found in this forum.</p>
            <p className="mt-2">Be the first to create a thread!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentForum.threads.map((thread) => (
              <div key={thread._id}>
                <Link to={linkToPosts+thread._id+"/"+1}>
                  <div className="border p-4 rounded hover:bg-gray-50 bg-white dark:bg-neutral-800 dark:hover:bg-neutral-700">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold">{thread.title}</h2>
                      {authAdmin && (
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === thread._id ? null : thread._id);
                            }}
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          
                          {openMenuId === thread._id && (
                            <div 
                              className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-neutral-800 dark:border-neutral-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setThreadToDelete({id: thread._id, weaviateId: thread.weaviateId});
                                  setShowDeleteModal(true);
                                  setOpenMenuId(null);
                                }}
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-300"
                              >
                                Delete Thread
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
        
        <DeleteModal 
          deleteHandler={handleDeleteThread} 
          isModalOpen={showDeleteModal} 
          content='Confirm you want to delete this thread?' 
          setIsModalOpen={setShowDeleteModal} 
        />
      </div>
    </div>
  );
};

export default ForumPage;