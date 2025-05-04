import React, { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/forums/search-bar";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import { Notification } from "@/stores/ForumStore/types";
import ForumListSkeleton from "@/components/skeletons/ForumListSkeleton";
import type { Forum } from "@/stores/ForumStore/types";
import { motion } from "framer-motion";
import { routeVariants } from "@/lib/routeAnimation";
import { DeleteModal } from "@/components/modals/DeleteModal"; 
import ThreadModal from "@/components/forums/ThreadModal";
import { useAuthStore } from "@/stores/AuthStore/useAuthStore";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import GuidelinesModal from '@/components/forums/GuidelinesModal';
import { Helmet } from "react-helmet-async";
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

  function requestSubmitHandler(data: {title: string, description: string}){
    createForumRequest(data.title, data.description)
    setShowRequestModal(false)
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
        fetchForums(isAdminRoute);
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
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
      className="h-full pb-[26rem] md:pb-48 lg:pb-20 dark:bg-neutral-950"
      variants={routeVariants}
      initial="initial"
      animate="final"
      exit="exit"
    >
      <Helmet>
        <title>Forums | CacheUp</title>
      </Helmet>
      <div className="max-w-6xl mx-auto p-6 translate-y-20 min-h-[calc(100vh-5.1rem)]">
        <div className="flex flex-col mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {isAdminRoute ? "Forums Section (Admin View)" : "Forums Section"}
            </h1>
            {!isAdminRoute &&   
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors duration-200"
                onClick={handleForumRequest}
              >
                Request Forum
              </button>
            }
            {isAdminRoute && <div className="">
                <div className="space-x-4">
                  <Link
                    to="/admin/requested-forums"
                    className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline"
                  >
                    Requested Forums
                  </Link>
                  <Link
                    to="/admin/forums"
                    className="inline-block rounded-md bg-blue-500 px-4 py-2 text-white shadow-md transition-colors hover:bg-blue-600 no-underline"
                  >
                    Create Forums +
                  </Link>
                </div>
              </div>
            }
          </div>
          
          {/* Add Guidelines button */}
          <button
            onClick={() => setShowGuidelines(true)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-md transition-colors duration-200 mt-3 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="flex border-b border-gray-400 dark:border-neutral-700 mb-6">
          <button
            className={`py-2 px-4 font-medium text-sm mr-4 ${
              activeTab === 'forums'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('forums')}
          >
            Forums
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm relative ${
              activeTab === 'notifications'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
            {notifications && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs text-white">
                {notifications.length}
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
              <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 py-6">
                  No forums available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forums.map((forum) => (
                  <div
                    key={forum._id}
                    className="bg-white dark:bg-neutral-800 dark:border dark:shadow-neutral-700 dark:border-neutral-700 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 relative"
                  >
                    {isAdminRoute && (
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => toggleDeleteMenu(forum._id, e)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label="Menu"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>

                        {deleteMenuOpen === forum._id && (
                          <div
                            className="absolute right-0 mt-2 w-48 bg-white dark:border-gray-500 dark:bg-neutral-700 rounded-md shadow-lg z-10 border border-gray-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setEditingForum(forum)}
                              className="block border-b border-gray-400 dark:border-neutral-600 w-full text-left px-4 py-2 dark:text-gray-200 dark:hover:bg-neutral-800 rounded-t-lg text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit Forum
                            </button>
                            <button
                              onClick={() => setDeleteConfirmationForum(forum)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-b-lg"
                            >
                              Delete Forum
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-300">
                      {forum.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {forum.description}
                    </p>
                    <div className="text-sm text-gray-500 mb-4">
                      Created:{" "}
                      {formatDate(forum.createdAt)}
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
          </>
        )}

        {activeTab === 'notifications' && (
          (authUser ? <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Your Notifications</h2>
            
            {!notifications || notifications.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-6">
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
                    className="py-4 hover:bg-gray-50 dark:hover:bg-neutral-700 px-2 rounded transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-start notification-container">
                      <Link to={`/forums/thread/${notification.threadId}/${notification.pageNumber}?post=${notification.postId}`}>
                      <div className="flex-1">
                        {formatNotificationMessage(notification)}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      </Link>
                      {notification.seenBy && notification.seenBy.length === 0 && (
                        <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> : 
          <div className="translate-y-20">
            <SignInNavigation />
          </div>
          )
          
        )}

        {editingForum && createPortal(
          <div className="fixed inset-0 bg-black/50 backdrop-blur-[1.5px] dark:bg-neutral-900/80  flex items-center justify-center z-50">
            <div ref={editModalRef} className="bg-white dark:bg-neutral-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Forum</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-gray-100 border border-gray-300 dark:border-neutral-500 dark:bg-neutral-600"
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
                    className="w-full px-3 py-2 rounded-md h-32 bg-gray-100 border border-gray-300 dark:border-neutral-500 dark:bg-neutral-600"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingForum(null)}
                    className="px-4 py-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-neutral-600 dark:text-gray-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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