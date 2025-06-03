import React, { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/forums/search-bar";
import { useForumStore } from "@/stores/ForumStore/useforumStore";
import toast from "react-hot-toast";
import { Notification } from "@/stores/ForumStore/types";
import ForumListSkeleton from "@/components/skeletons/ForumListSkeleton";
import type { Forum } from "@/stores/ForumStore/types";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";
import { DeleteModal } from "@/components/modals/DeleteModal"; 
import ThreadModal from "@/components/forums/ThreadModal";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import { createPortal } from "react-dom";
import GuidelinesModal from '@/components/forums/GuidelinesModal';
import { LoginPromptModal } from "@/components/modals/LoginPromptModal";
import SignInNavigation from "@/components/SignInNavigation";

interface ErrorResponse {
  msg: string;
}

const ForumList: React.FC = () => {
  const { forums, error, fetchForums, deleteForum, notifications, fetchNotifications, markNotificationRead, createForumRequest, editForum } = useForumStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmationForum, setDeleteConfirmationForum] = useState<Forum | null>(null);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'forums' | 'notifications'>('forums');
  const location = useLocation();
  const navigate = useNavigate();
  const {authUser} = useAuthStore()
  const [editingForum, setEditingForum] = useState<Forum | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false)
  const editModalRef = useRef<HTMLDivElement | null>(null)
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const requestSubmitHandler = async (data: {title: string, description: string}) => {
    try {
        const success = await createForumRequest(data.title, data.description);
        if (success) {
            setShowRequestModal(false);
        }
    } catch (error) {
        console.error('Failed to create forum request:', error);
        // Modal stays open on error
    }
  }

  const handleClickOutsideEditModal = (e: MouseEvent) => {
    if (editModalRef.current && !editModalRef.current.contains(e.target as Node)) {
      setEditingForum(null);
    }
  };

  useEffect(() => {
    if (editingForum) {
      setEditedTitle(editingForum.title);
      setEditedDescription(editingForum.description);
    }
    document.addEventListener("mousedown", handleClickOutsideEditModal, false);

    return () => document.removeEventListener("mousedown", handleClickOutsideEditModal, false)
  }, [editingForum]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingForum) return;

    try {
      await editForum(editingForum._id, editingForum.weaviateId, {
        title: editedTitle,
        description: editedDescription,
      });
      setEditingForum(null);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;
      toast.error(
        axiosError.response?.data?.msg ||
          "Failed to update forum. Please try again later."
      );
    }
  };

  const isAdminRoute = location.pathname.includes("/admin");

  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        await fetchForums(isAdminRoute);
        if(!isAdminRoute)
          fetchNotifications();
        setIsLoading(false)
    };
    
    loadData();
  }, [isAdminRoute, fetchForums, fetchNotifications]);

  const handleViewForum = (forum: Forum) => {
    navigate(
      `${isAdminRoute ? "/admin" : ""}/forums/${forum._id}/${forum.weaviateId}`
    );
  };

  const handleDeleteForum = () => {
    if (!deleteConfirmationForum) return;
    
    setIsDeleting(true);
    try {
      deleteForum(
        deleteConfirmationForum._id,
        deleteConfirmationForum.weaviateId
      );
    } catch (err) {
      toast.error(
        "Failed to delete forum. Please try again later."
      );
      console.error("Error while deleting forum: ", err)
    } finally {
      setIsDeleting(false);
      setDeleteConfirmationForum(null);
    }
  };

  const handleNotificationAction = async (notification: Notification, actionType: 'username' | 'content', event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (actionType === 'username' && notification.createdBy) {
        navigate(`/profile/${notification.createdBy._id}`);
    } else if (actionType === 'content') {
        await markNotificationRead(notification._id)
        const threadId = notification.threadId._id
        const postId = notification.postId;
        
        if (threadId && postId) {
            navigate(`/forums/thread/${threadId}?post=${postId}`);
        } else if (threadId) {
            navigate(`/forums/thread/${threadId}`);
        }
    }
  };

  const toggleDeleteMenu = (forumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteMenuOpen(deleteMenuOpen === forumId ? null : forumId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDeleteMenuOpen(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Helper to parse notification message and format it with clickable parts
  const formatNotificationMessage = (notification: Notification) => {
    if (!notification.message || !notification.createdBy) return null;
    
    const message = notification.message;
    const username = notification.createdBy.username;
    
    if (message.includes(username)) {
      const parts = message.split(username);
      return (
        <div className="text-gray-800 dark:text-gray-300">
          {parts[0]}
          <span 
            className="font-medium text-blue-600 dark:text-blue-400 cursor-pointer hover:underline"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the parent click
              handleNotificationAction(notification, 'username', e);
            }}
          >
            {username}
          </span>
          <span className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-200">
            {parts[1]}
          </span>
        </div>
      );
    }
    
    // Fallback if we can't parse the message properly
    return (
      <div className="text-gray-800 dark:text-gray-300">
        {message}
      </div>
    );
  };

  const handleForumRequest = () => {
    if (!authUser) {
      setShowLoginPrompt(true);
    } else {
      setShowRequestModal(true);
    }
  };

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6 translate-y-24">
        <div className="bg-red-100 border text-center border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }
    
  if (isLoading) {
    return <ForumListSkeleton />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div 
      className="h-full pb-32 md:pb-36 lg:pb-20 dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <div className="max-w-6xl mx-auto p-6 translate-y-14 sm:translate-y-16 lg:translate-y-20 min-h-[calc(100vh-5.1rem)]">
        <div className="flex flex-col mb-4 sm:mb-6">
          <div className="flex justify-between sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <h1 className="text-2xl font-bold">
              {isAdminRoute ? "Forums Section (Admin View)" : "Forums Section"}
            </h1>
            {!isAdminRoute &&   
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 sm:px-4 rounded transition-colors duration-200 text-sm sm:text-base whitespace-nowrap self-start sm:self-auto"
                onClick={handleForumRequest}
              >
                Request Forum
              </button>
            }
            {isAdminRoute && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Link
                  to="/admin/requested-forums"
                  className="inline-block text-center rounded-md bg-blue-500 px-3 sm:px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline text-sm sm:text-base whitespace-nowrap"
                >
                  Requested Forums
                </Link>
                <Link
                  to="/admin/forums"
                  className="inline-block text-center rounded-md bg-blue-500 px-3 sm:px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline text-sm sm:text-base whitespace-nowrap"
                >
                  Create Forums +
                </Link>
              </div>
            )}
          </div>
          
          {/* Add Guidelines button */}
          <button
            onClick={() => setShowGuidelines(true)}
            className="flex items-center gap-2 w-fit text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors duration-200 mt-2 sm:mt-3 font-medium text-sm sm:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" className="sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Forum Guidelines
          </button>
        </div>

        {authUser && showRequestModal && (
          <ThreadModal
            forum={true}
            onClose={() => setShowRequestModal(false)}
            onSubmit={requestSubmitHandler}
          />
        )}
        
        {/* Tab navigation */}
        <div className="flex border-b border-gray-400 dark:border-neutral-700 mb-4 sm:mb-6">
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm mr-3 sm:mr-4 ${
              activeTab === 'forums'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('forums')}
          >
            Forums
          </button>
          <button
            className={`py-2 px-3 sm:px-4 font-medium text-sm relative ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
            {notifications && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs text-white">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'forums' && (
          <>
            <SearchBar />

            {isLoading ? (
              <ForumListSkeleton />
            ) : forums.length === 0 ? (
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 sm:p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 py-4 sm:py-6 text-sm sm:text-base">
                  No forums available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {forums.map((forum) => (
                  <div
                    key={forum._id}
                    className="bg-white min-h-[220px] sm:min-h-[260px] dark:bg-neutral-800 dark:border dark:shadow-neutral-700 dark:border-neutral-700 rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 relative flex flex-col"
                  >
                    {isAdminRoute && (
                      <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                        <button
                          onClick={(e) => toggleDeleteMenu(forum._id, e)}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          aria-label="Menu"
                        >
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {deleteMenuOpen === forum._id && (
                          <div
                            className="absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:border-gray-500 dark:bg-neutral-700 rounded-md shadow-lg z-10 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setEditingForum(forum)}
                              className="block border-b border-gray-400 dark:border-neutral-600 w-full text-left px-3 sm:px-4 py-2 dark:text-gray-200 dark:hover:bg-neutral-800 rounded-t-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Forum
                            </button>
                            <button
                              onClick={() => setDeleteConfirmationForum(forum)}
                              className="block w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-b-lg"
                            >
                              Delete Forum
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <h2 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800 dark:text-gray-300 pr-8 sm:pr-10">
                      {forum.title}
                    </h2>
                    <p className="text-gray-600 mb-3 line-clamp-3 text-sm sm:text-base">
                      {forum.description}
                    </p>
                    <div className="text-xs sm:text-sm text-gray-500 mb-2">
                      Created: {formatDate(forum.createdAt)}
                    </div>
                    <div className="flex-grow" />
                    <div className="flex items-end mt-auto">
                      <button
                        onClick={() => handleViewForum(forum)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                        style={{ alignSelf: "flex-start" }}
                      >
                        View Threads
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'notifications' && (
          (authUser ? <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Your Notifications</h2>
            
            {!notifications || notifications.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4 sm:py-6 text-sm sm:text-base">
                No notifications available.
              </p>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-neutral-700">
                {notifications.map((notification: Notification) => (
                  <div 
                    key={notification._id}
                    onClick={async (e) => {
                      if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.notification-container')) {
                        await handleNotificationAction(notification, 'content', e);
                      }
                    }}
                    className="py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors duration-200 cursor-pointer"
                  >
                    <Link to={`/forums/thread/${notification.threadId}/${notification.pageNumber}?post=${notification.postId}`}>
                      <div className="flex items-start notification-container justify-between">
                        <div className="flex-1">
                          {formatNotificationMessage(notification)}
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                        {notification.seenBy && notification.seenBy.length === 0 && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div> : 
          <div className="translate-y-12 sm:translate-y-16 lg:translate-y-20">
            <SignInNavigation />
          </div>
          )
          
        )}

        {editingForum && createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80 flex items-center justify-center z-50 p-4">
            <div ref={editModalRef} className="bg-white dark:bg-neutral-800 rounded-lg p-4 sm:p-6 w-full max-w-md">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Forum</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-300 dark:border-neutral-500 dark:bg-neutral-600 text-sm sm:text-base"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-md h-24 sm:h-32 bg-gray-100 border border-gray-300 dark:border-neutral-500 dark:bg-neutral-600 text-sm sm:text-base resize-none"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingForum(null)}
                    className="px-4 py-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-600 dark:text-gray-100 rounded text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm sm:text-base"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>, 
          document.body
        )}

        <DeleteModal
          deleteHandler={handleDeleteForum}
          isModalOpen={deleteConfirmationForum !== null}
          setIsModalOpen={(isOpen) => {
            if (!isOpen) setDeleteConfirmationForum(null);
          }}
          content={deleteConfirmationForum ? `Are you sure you want to delete the forum "${deleteConfirmationForum.title}"? This action cannot be undone.` : ""}
          isDeleting={isDeleting}
          title="Delete Forum"
        />

        {/* Add Guidelines Modal */}
        <GuidelinesModal 
          isOpen={showGuidelines}
          onClose={() => setShowGuidelines(false)}
        />

        {/* Add LoginPromptModal */}
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          title="Sign In Required"
          content="Please sign in to request a new forum and join the discussion."
        />
      </div>
    </motion.div>
  );
};

export default ForumList;