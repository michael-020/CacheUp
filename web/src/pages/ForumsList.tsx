import React, { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchBar } from "@/components/forums/search-bar";
import { useForumStore } from "@/stores/ForumStore/forumStore";
import type { Forum } from "@/stores/ForumStore/types";
interface ErrorResponse {
  msg: string;
}

const ForumList: React.FC = () => {
  const { forums, error, fetchForums, deleteForum } = useForumStore();
  const [deleteConfirmationForum, setDeleteConfirmationForum] =
    useState<Forum | null>(null);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { editForum } = useForumStore();
  const [editingForum, setEditingForum] = useState<Forum | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");

  useEffect(() => {
    if (editingForum) {
      setEditedTitle(editingForum.title);
      setEditedDescription(editingForum.description);
    }
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
      alert(
        axiosError.response?.data?.msg ||
          "Failed to update forum. Please try again later."
      );
    }
  };

  const isAdminRoute = location.pathname.includes("/admin");

  useEffect(() => {
    fetchForums(isAdminRoute);
  }, [isAdminRoute, fetchForums]);

  const handleViewForum = (forum: Forum) => {
    navigate(
      `${isAdminRoute ? "/admin" : ""}/forums/${forum._id}/${forum.weaviateId}`
    );
  };

  const toggleDeleteMenu = (forumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteMenuOpen(deleteMenuOpen === forumId ? null : forumId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDeleteMenuOpen(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">
        {isAdminRoute ? "All Forums (Admin View)" : "All Forums"}
      </h1>

      <SearchBar />

      {forums.length === 0 ? (
        <p className="text-gray-600 text-center">No forums available.</p>
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
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setEditingForum(forum)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Forum
                      </button>
                      <button
                        onClick={() => setDeleteConfirmationForum(forum)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete Forum
                      </button>
                    </div>
                  )}
                </div>
              )}

              {editingForum && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                          className="w-full px-3 py-2 border rounded-md"
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
                          className="w-full px-3 py-2 border rounded-md h-32"
                          required
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingForum(null)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
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
                </div>
              )}

              {deleteConfirmationForum && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h2 className="text-xl font-bold mb-4">Delete Forum</h2>
                    <p className="mb-6">
                      Are you sure you want to delete the forum "
                      {deleteConfirmationForum.title}"? This action cannot be
                      undone.
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmationForum(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await deleteForum(
                              deleteConfirmationForum._id,
                              deleteConfirmationForum.weaviateId
                            );
                            setDeleteConfirmationForum(null);
                          } catch (err) {
                            const axiosError = err as AxiosError<ErrorResponse>;
                            alert(
                              axiosError.response?.data?.msg ||
                                "Failed to delete forum. Please try again later."
                            );
                            setDeleteConfirmationForum(null);
                          }
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Delete Forum
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                {forum.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {forum.description}
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Created:{" "}
                {new Date(forum.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
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
