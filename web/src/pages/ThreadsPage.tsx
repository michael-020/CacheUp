import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import { useForumStore } from '@/stores/ForumStore/useforumStore';
import ThreadModal from '../components/forums/ThreadModal';
import { ArrowLeft } from 'lucide-react';
import ForumPageSkeleton from '../components/skeletons/ThreadsPageSkeleton';
import { useAuthStore } from '@/stores/AuthStore/useAuthStore'; 
import { MoreVertical } from 'lucide-react';
import { useAdminStore } from '@/stores/AdminStore/useAdminStore';
import { DeleteModal } from '@/components/modals/DeleteModal';
import { SearchBar } from '@/components/forums/search-bar';
import { LoginPromptModal } from "@/components/modals/LoginPromptModal";
import toast from 'react-hot-toast';

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
    reportThread
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (forumMongoId) {
        await fetchThreads(forumMongoId, isAdminRoute);
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [forumMongoId, fetchThreads, isAdminRoute]);
  
  const handleCreateThread = async (threadData: { title: string; description: string }) => {
    try {
        if (!forumMongoId || !forumWeaviateId) return;
        
        if (threadData.title.length >= 50) {
            toast.error("Title can be only 50 characters long");
            return;
        }
        
        const success = await createThread(forumMongoId, forumWeaviateId, threadData, isAdminRoute);
        if (success) {
            setShowModal(false); // Only close modal on success
        }
    } catch (error) {
        console.error('Failed to create thread:', error);
        // Modal stays open on error
    }
  };

  const handleDeleteThread = () => {
    if (threadToDelete) {
      deleteThread(threadToDelete.id, threadToDelete.weaviateId);
      setShowDeleteModal(false);
      setThreadToDelete(null);
    }
  };

  const handleCreateThreadClick = () => {
    if (!authUser) {
      setShowLoginPrompt(true);
    } else {
      setShowModal(true);
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
    <div className='pb-32 sm:pb-36 lg:pb-24 dark:bg-neutral-950 min-h-screen'>
      <div className="max-w-6xl mx-auto p-3 sm:p-4 lg:p-6 translate-y-16 sm:translate-y-20 lg:translate-y-24 h-full">
        <SearchBar />
        
        <div className="flex justify-between items-start gap-3 mb-4 sm:mb-6">
          <div className='flex items-center min-w-0 flex-1'>
            <button
              onClick={() => navigate(-1)}
              className="mr-2 p-2 sm:p-3 rounded-full hover:bg-gray-400 dark:hover:bg-neutral-700 flex-shrink-0"
            >
              <ArrowLeft className="size-5 text-gray-600 dark:text-gray-300" />
            </button>

            <h1 className="text-lg sm:text-lg lg:text-2xl font-bold truncate">
              {currentForum.title}'s Forum
            </h1>
          </div>


          {!authAdmin && (
            <button
              onClick={handleCreateThreadClick}
              className="bg-blue-500 text-white px-3 sm:px-3 lg:px-4 py-2 sm:py-2 rounded hover:bg-blue-600 text-sm sm:text-sm lg:text-base whitespace-nowrap flex-shrink-0"
            >
              Create Thread
            </button>
          )}
        </div>

        {currentForum.error && (
          <div className="text-red-500 mb-4 text-sm sm:text-base">{currentForum.error}</div>
        )}
        
        {currentForum.threads.length === 0 ? (
          <div>
          <h2 className='pb-6'>{currentForum.description}</h2>
          <div className="text-center py-6 sm:py-8 bg-white rounded dark:bg-neutral-800">
            <p className="text-sm sm:text-base">No threads found in this forum.</p>
            <p className="mt-2 text-sm sm:text-base">Be the first to create a thread!</p>
          </div>
          </div>
        ) : (
          <div>
          <h2 className='pb-6'>{currentForum.description}</h2>

          <div className="space-y-3 sm:space-y-4">
            {currentForum.threads.map((thread) => (
              <div key={thread._id}>
                <Link to={linkToPosts+thread._id+"/"+1}>
                  <div className="border p-3 sm:p-4 rounded hover:bg-gray-50 bg-white dark:bg-neutral-800 dark:hover:bg-neutral-700">
                    <div className="flex justify-between items-start gap-3">
                      <h2 className="text-base sm:text-lg lg:text-xl font-semibold min-w-0 flex-1 pr-2">
                        {thread.title}
                      </h2>
                      
                      {authUser && !authAdmin && (
                        <div className="relative flex-shrink-0">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === thread._id ? null : thread._id);
                            }}
                            className="p-1"
                          >
                            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>

                          {openMenuId === thread._id && (
                            <div 
                              className="absolute right-0 mt-2 w-28 sm:w-32 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-neutral-800 dark:border-neutral-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  reportThread(thread._id, authUser._id.toString())
                                  setOpenMenuId(null);
                                }}
                                className="block w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-yellow-50 dark:hover:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                              >
                                {thread.reportedBy.includes(authUser._id.toString()) ? "Unreport" : "Report"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {authAdmin && (
                        <div className="relative flex-shrink-0">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === thread._id ? null : thread._id);
                            }}
                            className="p-1"
                          >
                            <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          
                          {openMenuId === thread._id && (
                            <div 
                              className="absolute right-0 mt-2 w-28 sm:w-32 bg-white border border-gray-200 rounded shadow-lg z-10 dark:bg-neutral-800 dark:border-neutral-700"
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
                                className="block w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-300"
                              >
                                Delete Thread
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-2 text-gray-600 truncate text-sm sm:text-base">
                      {thread.description}
                    </p>
                    
                    <div className="mt-3 flex justify-between text-xs sm:text-sm text-gray-500">
                      <span>Created: {new Date(thread.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
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

        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          title="Sign In Required"
          content="Please sign in to create threads and join the discussion."
        />
      </div>
    </div>
  );
};

export default ForumPage;