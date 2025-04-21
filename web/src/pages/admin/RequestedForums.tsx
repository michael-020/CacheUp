import { useEffect } from "react";
import { useForumStore } from "@/stores/ForumStore/forumStore";

export const RequestedForums = () => {
  const { requestedForums, loading, error, fetchRequestedForums } = useForumStore();

  useEffect(() => {
    fetchRequestedForums();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-10 w-10 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 1116 0 8 8 0 01-16 0zm2 0a6 6 0 1012 0 6 6 0 00-12 0z"
          ></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6">Pending Forum Requests</h1>
      {requestedForums.length === 0 ? (
        <p className="text-lg text-gray-600">No requests found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {requestedForums.map((req) => (
            <div key={req._id} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{req.title}</h3>
                <p className="text-gray-600 mt-2">{req.description}</p>
                <div className="mt-4 flex items-center">
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={req.requestedBy.profilePicture || "/default-profile.png"}
                    alt={req.requestedBy.username}
                  />
                  <span className="ml-2 text-gray-700">{req.requestedBy.username}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Requested on: {new Date(req.createdAt).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                  onClick={() => console.log('Approve action')}>
                  Approve
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
                  onClick={() => console.log('Deny action')}>
                  Deny
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

